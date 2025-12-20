'use server';

import { db as prisma } from "@/lib/db";
import { NewsItem } from "@/types/mod";
import { PrismaNewsWithTags, PrismaTagWithCount, mapPrismaTagToTagData, mapPrismaTagWithCountToTagData } from "@/types/database";

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
            mod: {
                include: {
                    tags: {
                        include: {
                            tag: true
                        }
                    }
                }
            },
            tags: {
                include: {
                    tag: true
                }
            }
        }
    });

    return news.map((item: any) => {
        // Map news tags
        const tags = item.tags.map((t: any) => ({
            id: t.tag.id,
            value: t.tag.value,
            displayName: t.tag.displayName,
            color: t.tag.color,
            category: t.tag.category
        }));

        // If associated with a mod, try to inject the mod's gamever tag if missing
        if (item.mod && item.mod.tags) {
            const modGameVerTag = item.mod.tags.find((t: any) => t.tag.category === 'gamever');
            if (modGameVerTag) {
                // Check if we already have a tag with this value
                const hasTag = tags.some((t: any) => t.category === 'gamever' && t.value === modGameVerTag.tag.value);
                if (!hasTag) {
                    tags.push({
                        id: modGameVerTag.tag.id,
                        value: modGameVerTag.tag.value,
                        displayName: modGameVerTag.tag.displayName,
                        color: modGameVerTag.tag.color,
                        category: modGameVerTag.tag.category
                    });
                }
            }
        }

        return {
            id: item.id,
            modSlug: item.modId || '',
            modName: item.mod?.title || 'System',
            description: item.title,
            date: item.date.toISOString(),
            tags: tags,
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

    return tags.map((tag: PrismaTagWithCount) => mapPrismaTagWithCountToTagData(tag));
}
