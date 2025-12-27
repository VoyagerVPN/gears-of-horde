'use server';

import { db as prisma } from "@/lib/db";
import { NewsItem, FrozenTag } from "@/schemas/news.schema";
import { Prisma } from "@/generated/prisma";

export async function fetchLatestNews(limit: number = 10, skip: number = 0, tag?: string): Promise<NewsItem[]> {
    // Build filter for tag if provided
    const where: Prisma.NewsWhereInput = {};
    if (tag) {
        // Filter by tags stored in JSON array
        where.tags = {
            path: [],
            array_contains: [{ displayName: tag }]
        };
    }

    const news = await prisma.news.findMany({
        take: limit,
        skip: skip,
        where,
        orderBy: { date: 'desc' }
    });

    return news.map((item) => ({
        id: item.id,
        modSlug: item.modSlug || '',
        modName: item.modName || 'Unknown',
        modVersion: item.modVersion || undefined,
        gameVersion: item.gameVersion || undefined,
        actionText: item.actionText || 'released',
        content: item.content,
        description: item.description || undefined,
        date: item.date.toISOString(),
        tags: (item.tags as FrozenTag[]) || [],
        wipeRequired: item.wipeRequired,
        sourceUrl: item.sourceUrl || ''
    }));
}

export async function fetchNewsTags(): Promise<FrozenTag[]> {
    // Since tags are now stored as JSON, we need to aggregate unique tags from all news items
    const news = await prisma.news.findMany({
        select: {
            tags: true
        }
    });

    const tagMap = new Map<string, FrozenTag>();

    for (const item of news) {
        const tags = item.tags as FrozenTag[];
        if (Array.isArray(tags)) {
            for (const tag of tags) {
                if (tag.displayName && !tagMap.has(tag.displayName)) {
                    tagMap.set(tag.displayName, tag);
                }
            }
        }
    }

    return Array.from(tagMap.values()).sort((a, b) =>
        a.displayName.localeCompare(b.displayName)
    );
}

// ============================================================================
// ADMIN NEWS MANAGEMENT ACTIONS
// ============================================================================

import { revalidatePath } from "next/cache";
import { NewsUpdate } from "@/schemas/news.schema";

/**
 * Fetch all news items for admin management (ordered by date desc)
 */
export async function fetchAllNews(limit: number = 50, skip: number = 0): Promise<NewsItem[]> {
    const news = await prisma.news.findMany({
        take: limit,
        skip: skip,
        orderBy: { date: 'desc' }
    });

    return news.map((item) => ({
        id: item.id,
        modSlug: item.modSlug || '',
        modName: item.modName || 'Unknown',
        modVersion: item.modVersion || undefined,
        gameVersion: item.gameVersion || undefined,
        actionText: item.actionText || 'released',
        content: item.content,
        description: item.description || undefined,
        date: item.date.toISOString(),
        tags: (item.tags as FrozenTag[]) || [],
        wipeRequired: item.wipeRequired,
        sourceUrl: item.sourceUrl || ''
    }));
}

/**
 * Update a news item (admin only)
 */
export async function updateNews(id: string, data: NewsUpdate) {
    try {
        await prisma.news.update({
            where: { id },
            data: {
                modName: data.modName,
                modSlug: data.modSlug,
                modVersion: data.modVersion,
                gameVersion: data.gameVersion,
                actionText: data.actionText,
                content: data.content,
                description: data.description,
                date: data.date,
                wipeRequired: data.wipeRequired,
                sourceUrl: data.sourceUrl,
                tags: data.tags as Prisma.InputJsonValue
            }
        });

        revalidatePath('/news');
        revalidatePath('/profile/news');
        return { success: true };
    } catch (error) {
        console.error("Failed to update news:", error);
        return { success: false, error: String(error) };
    }
}

/**
 * Delete a news item (admin only)
 */
export async function deleteNews(id: string) {
    try {
        await prisma.news.delete({
            where: { id }
        });

        revalidatePath('/news');
        revalidatePath('/profile/news');
        return { success: true };
    } catch (error) {
        console.error("Failed to delete news:", error);
        return { success: false, error: String(error) };
    }
}

