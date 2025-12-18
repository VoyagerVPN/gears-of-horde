'use server';

import { db as prisma } from "@/lib/db";
import { NewsItem } from "@/types/mod";

export async function fetchLatestNews(limit: number = 10, skip: number = 0, tag?: string): Promise<NewsItem[]> {
    const where: any = {};
    if (tag) {
        where.tags = {
            some: {
                tag: {
                    displayName: tag
                }
            }
        };
    }

    const news = await prisma.news.findMany({
        take: limit,
        skip: skip,
        where,
        orderBy: { date: 'desc' },
        include: {
            mod: true,
            tags: {
                include: {
                    tag: true
                }
            }
        }
    });

    return news.map((item: any) => {
        // Map all tags
        const tags = item.tags.map((t: any) => ({
            id: t.tag.id,
            value: t.tag.value,
            displayName: t.tag.displayName,
            color: t.tag.color,
            category: t.tag.category
        }));

        // Find legacy category for backward compatibility (optional, can be removed if not needed)
        // We will prioritize the 'newscat' tags for the main display if we want to mimic old behavior,
        // or just return all tags. The UI will decide what to show.
        // For now, let's just return all tags.

        return {
            id: item.id,
            modSlug: item.modId || '',
            modName: item.mod?.title || 'System',
            description: item.title,
            date: item.date.toISOString(),
            tags: tags, // New field
            gameVersion: item.mod?.gameVersion,
            isSaveBreaking: item.wipeRequired,
            sourceUrl: item.sourceUrl || ''
        };
    });
}

export async function fetchNewsTags(): Promise<any[]> {
    const tags = await prisma.tag.findMany({
        where: {
            newsTags: {
                some: {}
            }
        },
        include: {
            _count: {
                select: { newsTags: true }
            }
        },
        orderBy: {
            displayName: 'asc'
        }
    });

    return tags.map((tag: any) => ({
        id: tag.id,
        category: tag.category,
        value: tag.value,
        displayName: tag.displayName,
        color: tag.color,
        usageCount: tag._count.newsTags
    }));
}
