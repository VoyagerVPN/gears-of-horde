'use server';

import { db as prisma } from "@/lib/db";
import { ModData, ModStatusType } from "@/types/mod";

interface SearchFilters {
    tag?: string;
    lang?: string;
    version?: string;
    status?: string;
}

export async function searchMods(query: string, filters: SearchFilters = {}): Promise<ModData[]> {
    const { tag, lang, version, status } = filters;

    const whereClause: any = {
        AND: []
    };

    // Text Search (Title or Description)
    if (query) {
        whereClause.AND.push({
            OR: [
                { title: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } }
            ]
        });
    }

    // Tag Filter
    if (tag) {
        whereClause.AND.push({
            tags: {
                some: {
                    tag: {
                        displayName: { equals: tag, mode: 'insensitive' }
                    }
                }
            }
        });
    }

    // Language Filter
    if (lang) {
        whereClause.AND.push({
            tags: {
                some: {
                    tag: {
                        category: 'lang',
                        value: { equals: lang, mode: 'insensitive' }
                    }
                }
            }
        });
    }

    // Game Version Filter
    if (version) {
        whereClause.AND.push({
            gameVersion: version
        });
    }

    // Status Filter
    if (status) {
        whereClause.AND.push({
            status: status
        });
    }

    const mods = await prisma.mod.findMany({
        where: whereClause,
        orderBy: { updatedAt: 'desc' },
        include: {
            tags: {
                include: {
                    tag: true
                }
            }
        }
    });

    // Map to ModData
    return mods.map((mod: any) => ({
        ...mod,
        status: mod.status as ModStatusType,
        tags: mod.tags.map((mt: any) => ({
            id: mt.tag.id,
            displayName: mt.tag.displayName,
            color: mt.tag.color,
            category: mt.tag.category
        })),
        createdAt: mod.createdAt.toISOString(),
        updatedAt: mod.updatedAt.toISOString(),
        links: mod.links as any,
        videos: mod.videos as any,
        changelog: mod.changelog as any,
        localizations: mod.localizations as any,
        stats: {
            rating: mod.rating,
            ratingCount: mod.ratingCount,
            downloads: mod.downloads,
            views: mod.views
        }
    }));
}
