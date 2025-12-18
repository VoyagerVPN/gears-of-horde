'use server';

import { db as prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { ROUTES } from "@/lib/routes";

export interface TagData {
    id: string;
    category: string;
    value: string;
    displayName: string;
    color?: string | null;
    usageCount: number;
}

export async function fetchAllTags(): Promise<TagData[]> {
    const tags = await prisma.tag.findMany({
        include: {
            _count: {
                select: { modTags: true }
            }
        },
        orderBy: { category: 'asc' }
    });

    return tags.map((tag: { id: string; category: string; value: string; displayName: string; color: string | null; _count: { modTags: number } }) => ({
        id: tag.id,
        category: tag.category,
        value: tag.value,
        displayName: tag.displayName,
        color: tag.color,
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

    return tags.map((tag: { id: string; category: string; value: string; displayName: string; color: string | null; _count: { modTags: number } }) => ({
        id: tag.id,
        category: tag.category,
        value: tag.value,
        displayName: tag.displayName,
        color: tag.color,
        usageCount: tag._count.modTags
    }));
}

export async function fetchPopularTags(limit: number = 10): Promise<TagData[]> {
    const tags = await prisma.tag.findMany({
        where: {
            category: {
                notIn: ['gamever', 'author', 'status', 'lang', 'newscat'] // Exclude system categories if desired, or keep them. 
                // User said "Popular Tags" on homepage. Usually these are 'tag' category.
                // Let's filter by category 'tag' to be safe, or just show all?
                // "Migrating 'Popular Tags' on the homepage... sourced exclusively from the PostgreSQL database... sorted by usage count."
                // The hardcoded list had 'Overhaul', 'Magic', etc. which are likely 'tag' category.
                // So I should probably filter by category: 'tag'.
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

    return tags.map((tag: any) => ({
        id: tag.id,
        category: tag.category,
        value: tag.value,
        displayName: tag.displayName,
        color: tag.color,
        usageCount: tag._count.modTags
    }));
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
            modTags: {
                _count: 'desc'
            }
        },
        take: limit
    });

    return tags.map((tag: any) => ({
        id: tag.id,
        category: tag.category,
        value: tag.value,
        displayName: tag.displayName,
        color: tag.color,
        usageCount: tag._count.modTags
    }));
}

export async function createTag(data: { category: string; value: string; displayName: string; color?: string }) {
    // Import tag color defaults
    const { getTagColor } = await import('@/lib/tag-colors');

    // Auto-assign default color if not provided (except for gamever which uses dynamic gradient)
    const color = data.color || (data.category === 'gamever' ? undefined : getTagColor(data.category, data.value));

    await prisma.tag.create({
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
}

export async function updateTag(id: string, data: { category?: string; value?: string; displayName?: string; color?: string }) {
    const existingTag = await prisma.tag.findUnique({ where: { id } });

    const tag = await prisma.tag.update({
        where: { id },
        data
    });

    if (existingTag?.category === 'gamever' || tag.category === 'gamever') {
        await recalculateGameVersionColors();
    }

    revalidatePath(ROUTES.tags);
}

export async function deleteTag(id: string) {
    // Prisma handles cascade delete for ModTag and NewsTag if configured in schema
    // Schema says: onDelete: Cascade for ModTag and NewsTag
    const tag = await prisma.tag.findUnique({ where: { id } });

    await prisma.tag.delete({
        where: { id }
    });

    if (tag?.category === 'gamever') {
        await recalculateGameVersionColors();
    }

    revalidatePath(ROUTES.tags);
}

export async function mergeTags(sourceId: string, targetId: string) {
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
}

export async function recalculateGameVersionColors() {
    const gameVerTags = await prisma.tag.findMany({
        where: { category: 'gamever' }
    });

    // Parse version string like "V1.4", "v2.2", "2.4" into comparable parts
    function parseVersion(versionStr: string): number[] {
        // Remove 'V' or 'v' prefix and split by '.'
        const cleaned = versionStr.replace(/^[vV]/, '').trim();
        const parts = cleaned.split('.').map(p => {
            const num = parseFloat(p);
            return isNaN(num) ? 0 : num;
        });
        // Pad with zeros for consistent comparison
        while (parts.length < 3) parts.push(0);
        return parts;
    }

    // Compare two version strings: returns negative if a < b, positive if a > b
    function compareVersions(a: string, b: string): number {
        const aParts = parseVersion(a);
        const bParts = parseVersion(b);

        for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
            const aVal = aParts[i] || 0;
            const bVal = bParts[i] || 0;
            if (aVal !== bVal) return aVal - bVal;
        }
        return 0;
    }

    // Sort by version number (oldest first, newest last)
    // Use displayName as the source for version (e.g., "V1.4")
    gameVerTags.sort((a: { displayName: string }, b: { displayName: string }) =>
        compareVersions(a.displayName, b.displayName)
    );

    const count = gameVerTags.length;
    if (count === 0) return;

    // Gradient from Red (oldest) to Green (newest)
    // Red: #ef4444 (Tailwind red-500) -> RGB(239, 68, 68)
    // Green: #22c55e (Tailwind green-500) -> RGB(34, 197, 94)

    const startColor = { r: 239, g: 68, b: 68 };
    const endColor = { r: 34, g: 197, b: 94 };

    for (let i = 0; i < count; i++) {
        const tag = gameVerTags[i];
        let colorHex;

        if (count === 1) {
            colorHex = rgbToHex(endColor.r, endColor.g, endColor.b);
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
                await mergeTags(sourceTag.id, targetTag.id);
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
