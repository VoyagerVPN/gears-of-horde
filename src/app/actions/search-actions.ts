'use server';

import { db as prisma } from "@/lib/db";
import { ModData } from "@/types/mod";
import { Prisma } from "@/generated/prisma";
import { PrismaModWithTags, mapPrismaModToModData } from "@/types/database";

interface SearchFilters {
    tag?: string;
    lang?: string;
    version?: string;
    status?: string;
}

export async function searchMods(query: string, filters: SearchFilters = {}): Promise<ModData[]> {
    const { tag, lang, version, status } = filters;

    const whereClause: Prisma.ModWhereInput = {
        AND: []
    };
    // Ensure AND is initialized as array (typescript knows because of above, but runtime safety)
    if (!whereClause.AND) whereClause.AND = [];
    const andFilters = whereClause.AND as Prisma.ModWhereInput[];

    // Text Search (Title or Description)
    if (query) {
        andFilters.push({
            OR: [
                { title: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } }
            ]
        });
    }

    // Tag Filter
    if (tag) {
        andFilters.push({
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
        andFilters.push({
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
        andFilters.push({
            gameVersion: version
        });
    }

    // Status Filter
    if (status) {
        andFilters.push({
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
    return mods.map((mod) => mapPrismaModToModData(mod as unknown as PrismaModWithTags));
}

// ============ ADVANCED SEARCH FOR /MODS PAGE ============

export type SortOption = 'updated' | 'rating' | 'downloads' | 'views' | 'newest';

export interface AdvancedSearchFilters {
    query?: string;
    gameVersion?: string;
    includeTags?: string[];
    excludeTags?: string[];
    includeStatuses?: string[];
    excludeStatuses?: string[];
    sortBy?: SortOption;
    sortDir?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}

export interface SearchResult {
    mods: ModData[];
    totalCount: number;
    hasMore: boolean;
    page: number;
}

/**
 * Advanced mod search with filtering, pagination, and sorting for /mods page
 */
export async function searchModsAdvanced(filters: AdvancedSearchFilters = {}): Promise<SearchResult> {
    const {
        query,
        gameVersion,
        includeTags = [],
        excludeTags = [],
        includeStatuses = [],
        excludeStatuses = [],
        sortBy = 'updated',
        sortDir = 'desc',
        page = 1,
        limit = 24
    } = filters;

    const whereClause: Prisma.ModWhereInput = {
        AND: []
    };
    const andFilters = whereClause.AND as Prisma.ModWhereInput[];

    // Text Search (Title, Description, or Author)
    if (query && query.trim()) {
        andFilters.push({
            OR: [
                { title: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
                { author: { contains: query, mode: 'insensitive' } }
            ]
        });
    }

    // Game Version Filter
    if (gameVersion) {
        andFilters.push({
            gameVersion: { equals: gameVersion, mode: 'insensitive' }
        });
    }

    // Include Tags (AND logic - must have all)
    if (includeTags.length > 0) {
        for (const tagName of includeTags) {
            andFilters.push({
                tags: {
                    some: {
                        tag: {
                            displayName: { equals: tagName, mode: 'insensitive' }
                        }
                    }
                }
            });
        }
    }

    // Exclude Tags (must not have any of these)
    if (excludeTags.length > 0) {
        andFilters.push({
            NOT: {
                tags: {
                    some: {
                        tag: {
                            displayName: { in: excludeTags, mode: 'insensitive' }
                        }
                    }
                }
            }
        });
    }

    // Include Statuses (OR logic - any of these)
    if (includeStatuses.length > 0) {
        andFilters.push({
            status: { in: includeStatuses, mode: 'insensitive' }
        });
    }

    // Exclude Statuses (must not be any of these)
    if (excludeStatuses.length > 0) {
        andFilters.push({
            status: { notIn: excludeStatuses, mode: 'insensitive' }
        });
    }

    // Get total count for pagination
    const totalCount = await prisma.mod.count({
        where: whereClause
    });

    // Calculate offset
    const skip = (page - 1) * limit;

    // Build sort order
    let orderBy: Prisma.ModOrderByWithRelationInput[] = [];
    switch (sortBy) {
        case 'rating':
            orderBy = [{ rating: sortDir }, { ratingCount: sortDir }];
            break;
        case 'downloads':
            orderBy = [{ downloads: sortDir }];
            break;
        case 'views':
            orderBy = [{ views: sortDir }];
            break;
        case 'newest':
            orderBy = [{ createdAt: sortDir }];
            break;
        case 'updated':
        default:
            orderBy = [{ updatedAt: sortDir }];
            break;
    }

    // Fetch mods
    const mods = await prisma.mod.findMany({
        where: whereClause,
        orderBy,
        skip,
        take: limit,
        include: {
            tags: {
                include: {
                    tag: true
                }
            }
        }
    });

    // Map to ModData and sort by changelog date for "updated" sort
    let mappedMods = mods.map((mod) => mapPrismaModToModData(mod as unknown as PrismaModWithTags));

    // For "updated" sort, re-sort by changelog date (more accurate than updatedAt)
    if (sortBy === 'updated') {
        mappedMods.sort((a, b) => {
            const getLatestDate = (m: ModData) => {
                if (m.changelog && m.changelog.length > 0) {
                    const dates = m.changelog
                        .map(c => new Date(c.date).getTime())
                        .filter(t => !isNaN(t));
                    if (dates.length > 0) {
                        return Math.max(...dates);
                    }
                }
                return new Date(m.updatedAt || 0).getTime();
            };
            const diff = getLatestDate(b) - getLatestDate(a);
            return sortDir === 'desc' ? diff : -diff;
        });
    }

    return {
        mods: mappedMods,
        totalCount,
        hasMore: skip + mods.length < totalCount,
        page
    };
}

/**
 * Fetch all unique game versions for filter dropdown
 */
export async function fetchGameVersions(): Promise<string[]> {
    const versions = await prisma.mod.findMany({
        select: { gameVersion: true },
        distinct: ['gameVersion'],
        orderBy: { gameVersion: 'desc' }
    });
    return versions.map(v => v.gameVersion).filter(Boolean);
}

/**
 * Fetch all unique statuses for filter
 */
export async function fetchStatuses(): Promise<string[]> {
    const statuses = await prisma.mod.findMany({
        select: { status: true },
        distinct: ['status']
    });
    return statuses.map(s => s.status).filter(Boolean);
}

/**
 * Fetch popular tags with usage counts for filter sidebar
 */
export async function fetchPopularTagsForFilters(limit: number = 20): Promise<{ displayName: string; color?: string; count: number }[]> {
    const tagCounts = await prisma.modTag.groupBy({
        by: ['tagId'],
        _count: { tagId: true },
        orderBy: { _count: { tagId: 'desc' } },
        take: limit * 2 // Fetch more to filter
    });

    const tagIds = tagCounts.map(t => t.tagId);
    const tags = await prisma.tag.findMany({
        where: {
            id: { in: tagIds },
            category: 'tag' // Only show generic tags, not author/gamever/lang
        }
    });

    const tagMap = new Map(tags.map(t => [t.id, t]));

    return tagCounts
        .filter(tc => tagMap.has(tc.tagId))
        .map(tc => ({
            displayName: tagMap.get(tc.tagId)!.displayName,
            color: tagMap.get(tc.tagId)!.color || undefined,
            count: tc._count.tagId
        }))
        .slice(0, limit);
}

