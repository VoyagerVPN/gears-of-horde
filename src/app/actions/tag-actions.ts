'use server';

import { db as prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { ROUTES } from "@/lib/routes";
import { type TagData } from "@/schemas";
import {
    TagCreateSchema,
    TagUpdateSchema,
    TagMergeSchema,
    // CategoryRenameSchema,
} from "@/schemas";
import { validate, ok, err, type Result } from "@/lib/result";
import { PrismaTagWithCount, mapPrismaTagWithCountToTagData } from "@/types/database";
import { compareVersions } from "@/lib/tags";
import { GAME_VERSION_COLORS } from "@/lib/tag-colors";

// Re-export TagData for backwards compatibility
export type { TagData } from "@/schemas";

export async function fetchAllTags(): Promise<TagData[]> {
    const tags = await prisma.tag.findMany({
        include: {
            _count: {
                select: { modTags: true }
            }
        },
        orderBy: { category: 'asc' }
    });

    return tags.map((tag: { id: string; category: string; value: string; displayName: string; color: string | null; isExternal?: boolean; _count: { modTags: number } }) => ({
        id: tag.id,
        category: tag.category,
        value: tag.value,
        displayName: tag.displayName,
        color: tag.color,
        isExternal: tag.isExternal ?? false,
        usageCount: tag._count.modTags
    }));
}

export async function fetchTagsByCategory(category: string): Promise<TagData[]> {
    const tags = await prisma.tag.findMany({
        where: { category },
        include: {
            _count: {
                select: { modTags: true }
            }
        },
        orderBy: { displayName: 'asc' }
    });

    return tags.map((tag: PrismaTagWithCount) => mapPrismaTagWithCountToTagData(tag));
}

export async function fetchPopularTags(limit: number = 10, category?: string): Promise<TagData[]> {
    const tags = await prisma.tag.findMany({
        where: category ? {
            category: category
        } : {
            category: {
                notIn: ['gamever', 'author', 'status', 'lang', 'newscat'] // Exclude system categories
            }
        },
        include: {
            _count: {
                select: { modTags: true }
            }
        },
        orderBy: {
            modTags: {
                _count: 'desc'
            }
        },
        take: limit
    });

    return tags.map((tag: PrismaTagWithCount) => mapPrismaTagWithCountToTagData(tag));
}

export async function searchTags(query: string, category: string = 'tag', limit: number = 10): Promise<TagData[]> {
    if (!query || query.length < 1) return [];

    const tags = await prisma.tag.findMany({
        where: {
            category: category,
            displayName: {
                contains: query,
                mode: 'insensitive'
            }
        },
        include: {
            _count: {
                select: { modTags: true }
            }
        },
        orderBy: {
            displayName: 'asc'  // Sort alphabetically, not by popularity
        },
        take: limit
    });

    return tags.map((tag: PrismaTagWithCount) => mapPrismaTagWithCountToTagData(tag));
}

export async function createTag(rawData: unknown): Promise<Result<{ id: string }>> {
    // Validate with Zod
    const validated = validate(TagCreateSchema, rawData);
    if (!validated.success) {
        return validated;
    }
    const data = validated.data;

    // Import tag color defaults
    const { getTagColor } = await import('@/lib/tag-colors');

    // Auto-assign default color if not provided (except for gamever which uses dynamic gradient)
    const color = data.color || (data.category === 'gamever' ? undefined : getTagColor(data.category, data.value));

    try {
        const tag = await prisma.tag.create({
            data: {
                category: data.category,
                value: data.value,
                displayName: data.displayName,
                color: color
            }
        });

        if (data.category === 'gamever') {
            await recalculateGameVersionColors();
        }

        revalidatePath(ROUTES.tags);
        return ok({ id: tag.id });
    } catch (error) {
        console.error("Failed to create tag:", error);
        return err("Failed to create tag");
    }
}

export async function updateTag(id: string, rawData: unknown): Promise<Result<{ id: string }>> {
    // Validate with Zod
    const validated = validate(TagUpdateSchema, rawData);
    if (!validated.success) {
        return validated;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = (validated.data as any);

    if (!id || id.trim() === '') {
        return err("Tag ID is required");
    }

    try {
        const existingTag = await prisma.tag.findUnique({ where: { id } });
        if (!existingTag) {
            return err("Tag not found");
        }

        const tag = await prisma.tag.update({
            where: { id },
            data
        });

        if (existingTag.category === 'gamever' || tag.category === 'gamever') {
            await recalculateGameVersionColors();
        }

        revalidatePath(ROUTES.tags);
        return ok({ id: tag.id });
    } catch (error) {
        console.error("Failed to update tag:", error);
        return err("Failed to update tag");
    }
}

export async function deleteTag(id: string): Promise<Result<{ deleted: true }>> {
    if (!id || id.trim() === '') {
        return err("Tag ID is required");
    }

    try {
        // Prisma handles cascade delete for ModTag and NewsTag if configured in schema
        // Schema says: onDelete: Cascade for ModTag and NewsTag
        const tag = await prisma.tag.findUnique({ where: { id } });
        if (!tag) {
            return err("Tag not found");
        }

        await prisma.tag.delete({
            where: { id }
        });

        if (tag.category === 'gamever') {
            await recalculateGameVersionColors();
        }

        revalidatePath(ROUTES.tags);
        return ok({ deleted: true });
    } catch (error) {
        console.error("Failed to delete tag:", error);
        return err("Failed to delete tag");
    }
}

export async function mergeTags(rawData: unknown): Promise<Result<{ merged: true }>> {
    // Validate with Zod
    const validated = validate(TagMergeSchema, rawData);
    if (!validated.success) {
        return validated;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { sourceId, targetId } = (validated.data as any);

    try {
        // 0. Fetch source and target tags to check categories/values
        const sourceTag = await prisma.tag.findUnique({ where: { id: sourceId } });
        const targetTag = await prisma.tag.findUnique({ where: { id: targetId } });

        if (!sourceTag || !targetTag) {
            return err("Source or target tag not found");
        }

        // 1. Get all ModTags for source
        const sourceModTags = await prisma.modTag.findMany({
            where: { tagId: sourceId }
        });

        // 1.5 Sync Mod String Fields (gameVersion, author, status)
        // If the merged tag category corresponds to a specific Mod field, update that field
        const modIds = sourceModTags.map(mt => mt.modId);

        if (modIds.length > 0) {
            if (sourceTag.category === 'gamever' && targetTag.category === 'gamever') {
                // Update Mod.gameVersion to the NEW tag's displayName (e.g. "V1.0")
                await prisma.mod.updateMany({
                    where: {
                        slug: { in: modIds },
                        // Only update if it currently matches the old tag (avoid overwriting if it changed legitimately? 
                        // Actually, if it has the tag, it SHOULD match. But let's just update all mods having this tag.)
                    },
                    data: { gameVersion: targetTag.displayName }
                });
            } else if (sourceTag.category === 'author' && targetTag.category === 'author') {
                // Update Mod.author
                await prisma.mod.updateMany({
                    where: { slug: { in: modIds } },
                    data: { author: targetTag.displayName }
                });
            } else if (sourceTag.category === 'status' && targetTag.category === 'status') {
                // Update Mod.status (use value for status)
                await prisma.mod.updateMany({
                    where: { slug: { in: modIds } },
                    data: { status: targetTag.value }
                });
            }
        }

        // 2. For each source ModTag, check if target already exists
        for (const smt of sourceModTags) {
            const existingTarget = await prisma.modTag.findUnique({
                where: {
                    modId_tagId: {
                        modId: smt.modId,
                        tagId: targetId
                    }
                }
            });

            if (!existingTarget) {
                // Create new ModTag for target
                await prisma.modTag.create({
                    data: {
                        modId: smt.modId,
                        tagId: targetId
                    }
                });
            }
        }

        // Note: News now stores tags as JSON, no longer uses NewsTag junction table
        // So we only need to handle ModTags

        // 3. Delete source tag (cascades will clean up source ModTags)
        await prisma.tag.delete({
            where: { id: sourceId }
        });

        revalidatePath(ROUTES.tags);
        return ok({ merged: true });
    } catch (error) {
        console.error("Failed to merge tags:", error);
        return err("Failed to merge tags");
    }
}

export async function recalculateGameVersionColors() {
    const gameVerTags = await prisma.tag.findMany({
        where: { category: 'gamever' }
    });

    if (gameVerTags.length === 0) return;

    // Separate N/A from regular versions
    const naTags = gameVerTags.filter(t => t.value.toLowerCase() === 'na');
    const regularTags = gameVerTags.filter(t => t.value.toLowerCase() !== 'na');

    // Sort regular tags by version (exclude N/A from gradient)
    regularTags.sort((a: { value: string }, b: { value: string }) =>
        compareVersions(a.value, b.value)
    );

    const count = regularTags.length;

    // Gradient from Red (oldest) to Green (newest)
    const startColor = hexToRgb(GAME_VERSION_COLORS.oldest);
    const endColor = hexToRgb(GAME_VERSION_COLORS.newest);

    // Update N/A tags with constant zinc color
    for (const tag of naTags) {
        const naColor = GAME_VERSION_COLORS.na;
        if (tag.color !== naColor) {
            await prisma.tag.update({
                where: { id: tag.id },
                data: { color: naColor }
            });
        }
    }

    // Update regular version tags with gradient colors
    for (let i = 0; i < count; i++) {
        const tag = regularTags[i];
        let colorHex;

        if (count === 1) {
            colorHex = GAME_VERSION_COLORS.newest;
        } else {
            const ratio = i / (count - 1);
            const r = Math.round(startColor.r + (endColor.r - startColor.r) * ratio);
            const g = Math.round(startColor.g + (endColor.g - startColor.g) * ratio);
            const b = Math.round(startColor.b + (endColor.b - startColor.b) * ratio);
            colorHex = rgbToHex(r, g, b);
        }

        // Only update if color changed
        if (tag.color !== colorHex) {
            await prisma.tag.update({
                where: { id: tag.id },
                data: { color: colorHex }
            });
        }
    }
}

function rgbToHex(r: number, g: number, b: number) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

export async function renameCategory(oldCategory: string, newCategory: string) {
    const targetTags = await prisma.tag.findMany({ where: { category: newCategory } });
    const sourceTags = await prisma.tag.findMany({ where: { category: oldCategory } });

    if (targetTags.length === 0) {
        // Simple rename
        await prisma.tag.updateMany({
            where: { category: oldCategory },
            data: { category: newCategory }
        });
    } else {
        // Merge logic
        for (const sourceTag of sourceTags) {
            const targetTag = targetTags.find((t: { value: string }) => t.value === sourceTag.value);
            if (targetTag) {
                // Merge sourceTag into targetTag
                await mergeTags({ sourceId: sourceTag.id, targetId: targetTag.id });
            } else {
                // Just move it
                await prisma.tag.update({
                    where: { id: sourceTag.id },
                    data: { category: newCategory }
                });
            }
        }
    }

    if (oldCategory === 'gamever' || newCategory === 'gamever') {
        await recalculateGameVersionColors();
    }

    revalidatePath(ROUTES.tags);
}

export async function deleteCategory(category: string) {
    await prisma.tag.deleteMany({
        where: { category }
    });

    if (category === 'gamever') {
        await recalculateGameVersionColors();
    }

    revalidatePath(ROUTES.tags);
}
