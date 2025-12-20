'use server';

import { db as prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { ROUTES } from "@/lib/routes";
import { type TagData } from "@/schemas";
import {
    TagCreateSchema,
    TagUpdateSchema,
    TagMergeSchema,
    CategoryRenameSchema,
    type TagCreate,
    type TagUpdate
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
    const data = validated.data;

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
    const { sourceId, targetId } = validated.data;

    try {
        // 1. Get all ModTags for source
        const sourceModTags = await prisma.modTag.findMany({
            where: { tagId: sourceId }
        });

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

        // 3. Do the same for NewsTags
        const sourceNewsTags = await prisma.newsTag.findMany({
            where: { tagId: sourceId }
        });

        for (const snt of sourceNewsTags) {
            const existingTarget = await prisma.newsTag.findUnique({
                where: {
                    newsId_tagId: {
                        newsId: snt.newsId,
                        tagId: targetId
                    }
                }
            });

            if (!existingTarget) {
                await prisma.newsTag.create({
                    data: {
                        newsId: snt.newsId,
                        tagId: targetId
                    }
                });
            }
        }

        // 4. Delete source tag (cascades will clean up source ModTags/NewsTags)
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

    // Sort by version number (oldest first, newest last)
    // Use value as the source for version comparison (e.g., "1_4")
    gameVerTags.sort((a: { value: string }, b: { value: string }) =>
        compareVersions(a.value, b.value)
    );

    const count = gameVerTags.length;
    if (count === 0) return;

    // Gradient from Red (oldest) to Green (newest)
    const startColor = hexToRgb(GAME_VERSION_COLORS.oldest);
    const endColor = hexToRgb(GAME_VERSION_COLORS.newest);

    for (let i = 0; i < count; i++) {
        const tag = gameVerTags[i];
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
