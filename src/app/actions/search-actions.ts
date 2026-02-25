'use server';


import { ModData } from "@/schemas";
import { DatabaseModWithTags, mapDatabaseModToModData } from "@/types/database";
import { db } from "@/lib/db";

const MOD_SELECT_WITH_TAGS = `
    *,
    tags:ModTag (
        isExternal,
        externalLink,
        tag:Tag (
            id,
            category,
            value,
            displayName,
            color
        )
    )
`;

// ============ MOD SELECTOR SEARCH ============

export interface ModSelectorItem {
    id: string;
    title: string;
    slug: string;
    version: string;
    gameVersion: string;
    status: string;
}

/**
 * Lightweight mod search for selector dropdowns
 * Returns only title and slug for efficiency
 */
export async function searchModsForSelector(query: string, limit: number = 20): Promise<ModSelectorItem[]> {
    let q = db.from('Mod').select('title, slug, version, gameVersion, status');

    if (query.trim()) {
        q = q.or(`title.ilike.%${query}%,slug.ilike.%${query}%`);
    }

    const { data: mods } = await q
        .order('title', { ascending: true })
        .limit(limit);

    return (mods || []).map((m: { slug: string; title: string; version: string; gameVersion: string; status: string }) => ({
        id: m.slug,
        title: m.title,
        slug: m.slug,
        version: m.version,
        gameVersion: m.gameVersion,
        status: m.status
    }));
}

// ============ BASIC SEARCH ============

interface SearchFilters {
    tag?: string;
    lang?: string;
    version?: string;
    status?: string;
}

export async function searchMods(query: string, filters: SearchFilters = {}): Promise<ModData[]> {
    const { tag, lang, version, status } = filters;

    let q = db.from('Mod').select(MOD_SELECT_WITH_TAGS);

    if (query) {
        q = q.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
    }

    if (tag) {
        // Tag filter in basic search is usually by displayName
        const { data: tagMods } = await db
            .from('ModTag')
            .select('modId')
            .ilike('tag.displayName', tag);
        
        if (tagMods) {
            const ids = tagMods.map((t) => (t as { modId: string }).modId);
            q = q.in('slug', ids);
        }
    }

    if (lang) {
        const { data: langMods } = await db
            .from('ModTag')
            .select('modId')
            .eq('tag.category', 'lang')
            .ilike('tag.value', lang);
        
        if (langMods) {
            const ids = langMods.map((t) => (t as { modId: string }).modId);
            q = q.in('slug', ids);
        }
    }

    if (version) {
        q = q.eq('gameVersion', version);
    }

    if (status) {
        q = q.eq('status', status);
    }

    const { data: mods } = await q.order('updatedAt', { ascending: false });

    return (mods || []).map((m) => mapDatabaseModToModData(m as unknown as DatabaseModWithTags));
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

    let q = db.from('Mod').select(MOD_SELECT_WITH_TAGS, { count: 'exact' });

    // Text Search
    if (query && query.trim()) {
        q = q.or(`title.ilike.%${query}%,description.ilike.%${query}%,author.ilike.%${query}%`);
    }

    // Game Version Filter
    if (gameVersion) {
        q = q.ilike('gameVersion', gameVersion);
    }

    // Include Tags (AND logic)
    if (includeTags.length > 0) {
        // Fetch mods that have ALL the specified tags
        // Using a join-based approach to find mods containing all required tags
        const { data: tagIds } = await db
            .from('Tag')
            .select('id')
            .in('displayName', includeTags);

        if (!tagIds || tagIds.length < includeTags.length) {
            return { mods: [], totalCount: 0, hasMore: false, page };
        }

        const actualTagIds = tagIds.map(t => t.id);

        // Subquery to find mods that have all the tags
        const { data: matchedModIds } = await db
            .from('ModTag')
            .select('modId')
            .in('tagId', actualTagIds);

        if (!matchedModIds || matchedModIds.length === 0) {
            return { mods: [], totalCount: 0, hasMore: false, page };
        }

        // Count occurrences per modId, if count === includeTags.length, the mod has all tags
        const counts: Record<string, number> = {};
        matchedModIds.forEach(m => {
            counts[m.modId] = (counts[m.modId] || 0) + 1;
        });

        const intersectedIds = Object.keys(counts).filter(id => counts[id] === includeTags.length);

        if (intersectedIds.length === 0) {
            return { mods: [], totalCount: 0, hasMore: false, page };
        }

        q = q.in('slug', intersectedIds);
    }

    // Exclude Tags
    if (excludeTags.length > 0) {
        const { data: excludedModIds } = await db
            .from('ModTag')
            .select('modId')
            .in('tag.displayName', excludeTags);
        
        if (excludedModIds && excludedModIds.length > 0) {
            const ids = Array.from(new Set(excludedModIds.map((d) => (d as { modId: string }).modId)));
            q = q.not('slug', 'in', `(${ids.join(',')})`);
        }
    }

    // Include Statuses
    if (includeStatuses.length > 0) {
        q = q.in('status', includeStatuses);
    }

    // Exclude Statuses
    if (excludeStatuses.length > 0) {
        // PostgREST doesn't have a direct 'not in' for arrays, use .not('col', 'in', '(...)')
        q = q.not('status', 'in', `(${excludeStatuses.join(',')})`);
    }

    // Sorting
    const isAsc = sortDir === 'asc';
    switch (sortBy) {
        case 'rating':
            q = q.order('rating', { ascending: isAsc }).order('ratingCount', { ascending: isAsc });
            break;
        case 'downloads':
            q = q.order('downloads', { ascending: isAsc });
            break;
        case 'views':
            q = q.order('views', { ascending: isAsc });
            break;
        case 'newest':
            q = q.order('createdAt', { ascending: isAsc });
            break;
        case 'updated':
        default:
            q = q.order('updatedAt', { ascending: isAsc });
            break;
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    const { data: mods, count: totalCount, error } = await q.range(from, to);

    if (error) {
        console.error("Advanced search failed:", error);
        return { mods: [], totalCount: 0, hasMore: false, page };
    }

    let mappedMods = (mods || []).map((mod) => mapDatabaseModToModData(mod as unknown as DatabaseModWithTags));

    // For "updated" sort, re-sort by changelog date (more accurate than updatedAt)
    if (sortBy === 'updated') {
        mappedMods.sort((a: ModData, b: ModData) => {
            const getLatestDate = (m: ModData) => {
                if (m.changelog && m.changelog.length > 0) {
                    const dates = m.changelog
                        .map((c: any) => new Date(c.date).getTime())
                        .filter((t: number) => !isNaN(t));
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

    const currentTotal = totalCount || 0;

    return {
        mods: mappedMods,
        totalCount: currentTotal,
        hasMore: from + mappedMods.length < currentTotal,
        page
    };
}

/**
 * Fetch all game version tags for filter dropdown
 */
export async function fetchGameVersions() {
    const { data: tags } = await db
        .from('Tag')
        .select(`
            id,
            category,
            value,
            displayName,
            color,
            modTags:ModTag(count)
        `)
        .eq('category', 'gamever')
        .order('displayName', { ascending: false });

    return (tags || []).map((tag) => ({
        id: tag.id as string,
        category: tag.category as string,
        value: tag.value as string,
        displayName: tag.displayName as string,
        color: (tag.color as string | null) || undefined,
        usageCount: (tag.modTags as unknown as [{ count: number }])[0]?.count || 0
    }));
}

/**
 * Fetch all unique statuses for filter
 */
export async function fetchStatuses(): Promise<string[]> {
    const { data: tags } = await db
        .from('Tag')
        .select('value')
        .eq('category', 'status')
        .order('value', { ascending: true });
    
    return (tags || []).map((t) => (t as { value: string }).value);
}

/**
 * Fetch popular tags with usage counts for filter sidebar
 */
export async function fetchPopularTagsForFilters(limit: number = 1000): Promise<{ displayName: string; color?: string; count: number }[]> {
    try {
        // Tag popular query: category='tag' order by displayName
        const { data: tags } = await db
            .from('Tag')
            .select(`
                displayName,
                color,
                modTags:ModTag(count)
            `)
            .eq('category', 'tag')
            .order('displayName', { ascending: true })
            .limit(limit);

        return (tags || []).map((t) => ({
            displayName: t.displayName as string,
            color: (t.color as string | null) || undefined,
            count: (t.modTags as unknown as [{ count: number }])[0]?.count || 0
        }));
    } catch (error) {
        console.error('Error fetching popular tags:', error);
        return [];
    }
}

