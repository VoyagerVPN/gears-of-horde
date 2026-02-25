'use server';

import { ok, Result } from "@/lib/result";

import { ModData, TranslationSuggestion, ModStatusType } from "@/schemas";
import { DatabaseModWithTags, mapDatabaseModToModData, ModChangelogJson } from "@/types/database";
import { revalidatePath } from "next/cache";
import { ROUTES } from "@/lib/routes";
import { normalizeGameVersion } from "@/lib/utils";
import { db } from "@/lib/db";
import {
    findOrCreateAuthorTag,
    findOrCreateGameVerTag,
    findOrCreateGenericTag,
    findOrCreateLangTag,
    findOrCreateNewscatTag,
    findOrCreateStatusTag,
    removeModTagsByCategory,
    batchLinkTagsToMod,
    linkTagToModWithMetadata
} from "@/lib/tag-utils";

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

export interface FetchModsOptions {
    sortBy?: 'updated' | 'rating' | 'downloads' | 'views';
    sortDir?: 'asc' | 'desc';
}

interface TagUpdate {
    displayName: string;
    category?: string;
    value?: string;
    isExternal?: boolean;
    externalLink?: string;
}

export interface ModUpdatePayload {
    [key: string]: unknown; // Allow indexing
    title?: string;
    slug?: string;
    version?: string;
    description?: string;
    status?: ModStatusType;
    gameVersion?: string;
    bannerUrl?: string;
    isSaveBreaking?: boolean;
    features?: string | string[];
    installationSteps?: string | string[];
    links?: unknown;
    videos?: unknown;
    changelog?: ModChangelogJson[];
    localizations?: unknown;
    stats?: {
        rating: number;
        ratingCount: number;
        downloads: string;
        views: string;
    };
    screenshots?: string[];
    createdAt?: Date | string;
    updatedAt?: Date | string;
    eventType?: string;
    changes?: string[];
    date?: string;
    sourceUrl?: string;
    author?: string;
    tags?: TagUpdate[];
}

export async function fetchAllMods(options: FetchModsOptions = {}): Promise<ModData[]> {
    const { sortBy = 'updated', sortDir = 'desc' } = options;

    const { data: mods } = await db
        .from('Mod')
        .select(MOD_SELECT_WITH_TAGS)
        .order('updatedAt', { ascending: false });

    const mappedMods = (mods || []).map((mod: any) => mapDatabaseModToModData(mod as unknown as DatabaseModWithTags));

    // Perform in-memory sort to handle string-number fields (downloads, views) correctly
    if (sortBy) {
        mappedMods.sort((a: ModData, b: ModData) => {
            let valA: number | string | Date = 0;
            let valB: number | string | Date = 0;

            switch (sortBy) {
                case 'rating':
                    valA = a.stats.rating;
                    valB = b.stats.rating;
                    break;
                case 'downloads':
                    valA = parseInt(a.stats.downloads.replace(/[^0-9]/g, '') || '0');
                    valB = parseInt(b.stats.downloads.replace(/[^0-9]/g, '') || '0');
                    break;
                case 'views':
                    valA = parseInt(a.stats.views.replace(/[^0-9]/g, '') || '0');
                    valB = parseInt(b.stats.views.replace(/[^0-9]/g, '') || '0');
                    break;
                case 'updated':
                    {
                        const getLatestDate = (m: ModData) => {
                            if (m.changelog && m.changelog.length > 0) {
                                // Try to get the latest date from changelog
                                const dates = m.changelog
                                    .map(c => new Date(c.date).getTime())
                                    .filter(t => !isNaN(t));
                                if (dates.length > 0) {
                                    return Math.max(...dates);
                                }
                            }
                            return new Date(m.updatedAt || 0).getTime();
                        };
                        valA = getLatestDate(a);
                        valB = getLatestDate(b);
                    }
                    break;
                default:
                    return 0;
            }

            if (valA < valB) return sortDir === 'asc' ? -1 : 1;
            if (valA > valB) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });
    }

    return mappedMods;
}

export type ModCategory = 'updated' | 'featured' | 'top_rated';

/**
 * Fetch mods for main page sections by category
 */
export async function fetchModsByCategory(category: ModCategory, limit: number = 6): Promise<ModData[]> {
    switch (category) {
        case 'updated':
            return fetchRecentlyUpdatedMods(limit);
        case 'featured':
            return fetchFeaturedMods(limit);
        case 'top_rated':
            return fetchTopRatedMods(limit);
        default:
            return [];
    }
}

/**
 * Fetch recently updated mods (by changelog date or updatedAt)
 */
export async function fetchRecentlyUpdatedMods(limit: number = 6): Promise<ModData[]> {
    const { data: mods } = await db
        .from('Mod')
        .select(MOD_SELECT_WITH_TAGS)
        .order('updatedAt', { ascending: false })
        .limit(limit * 2);

    const mappedMods = (mods || []).map((mod: any) => mapDatabaseModToModData(mod as unknown as DatabaseModWithTags));

    // Sort by latest changelog date
    mappedMods.sort((a: ModData, b: ModData) => {
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
        return getLatestDate(b) - getLatestDate(a);
    });

    return mappedMods.slice(0, limit);
}

/**
 * Fetch featured mods (most downloads)
 * Uses total downloads as primary metric
 * TODO: Switch to downloadsThisMonth once tracking is implemented
 */
export async function fetchFeaturedMods(limit: number = 6): Promise<ModData[]> {
    // For now, use total downloads until monthly tracking is implemented
    const { data: mods } = await db
        .from('Mod')
        .select(MOD_SELECT_WITH_TAGS)
        .order('downloads', { ascending: false })
        .order('updatedAt', { ascending: false })
        .limit(limit);

    return (mods || []).map((mod) => mapDatabaseModToModData(mod as unknown as DatabaseModWithTags));
}

/**
 * Fetch top rated mods (minimum 3 ratings required)
 */
export async function fetchTopRatedMods(limit: number = 6, minRatings: number = 3): Promise<ModData[]> {
    const { data: mods } = await db
        .from('Mod')
        .select(MOD_SELECT_WITH_TAGS)
        .gte('ratingCount', minRatings)
        .order('rating', { ascending: false })
        .order('ratingCount', { ascending: false })
        .limit(limit);

    const resultMods = (mods || []).map((mod) => mapDatabaseModToModData(mod as unknown as DatabaseModWithTags));

    // If not enough mods meet the threshold, fill with any mods sorted by rating
    if (resultMods.length < limit) {
        const { data: additionalMods } = await db
            .from('Mod')
            .select(MOD_SELECT_WITH_TAGS)
            .lt('ratingCount', minRatings)
            .not('slug', 'in', `(${resultMods.map((m: ModData) => m.slug).join(',')})`)
            .order('rating', { ascending: false })
            .order('ratingCount', { ascending: false })
            .limit(limit - resultMods.length);
        
        if (additionalMods) {
            resultMods.push(...additionalMods.map((m) => mapDatabaseModToModData(m as unknown as DatabaseModWithTags)));
        }
    }

    return resultMods;
}

export async function fetchModBySlug(slug: string): Promise<ModData | null> {
    const { data: mod } = await db
        .from('Mod')
        .select(MOD_SELECT_WITH_TAGS)
        .eq('slug', slug)
        .maybeSingle();

    if (!mod) return null;

    return mapDatabaseModToModData(mod as unknown as DatabaseModWithTags);
}

export async function fetchPendingSuggestions(): Promise<TranslationSuggestion[]> {
    const { data: suggestions } = await db
        .from('TranslationSuggestion')
        .select('*')
        .eq('status', 'pending')
        .order('submittedAt', { ascending: false });

    return (suggestions || []).map((s) => ({
        id: s.id as string,
        modSlug: s.modSlug as string,
        modName: s.modName as string,
        languageCode: s.languageCode as string,
        languageName: s.languageName as string,
        author: s.author as string,
        link: s.link as string,
        status: s.status as 'pending' | 'approved' | 'rejected',
        submittedAt: typeof s.submittedAt === 'string' ? s.submittedAt : (s.submittedAt as Date).toISOString()
    }));
}

export async function approveTranslationSuggestion(id: string) {
    try {
        const { data: suggestion } = await db
            .from('TranslationSuggestion')
            .select('*')
            .eq('id', id)
            .single();
        
        if (!suggestion) return;

        // Create new lang tag if it doesn't exist
        const langTag = await findOrCreateLangTag(suggestion.languageName);

        // Link to mod with metadata
        await linkTagToModWithMetadata(suggestion.modSlug, langTag.id, {
            isExternal: true,
            externalLink: suggestion.link
        });

        // Update Suggestion status
        await db
            .from('TranslationSuggestion')
            .update({ status: 'approved' })
            .eq('id', id);

        return { success: true };
    } catch (error) {
        console.error("Failed to approve suggestion:", error);
        return { success: false, error };
    }
}

export async function rejectTranslationSuggestion(id: string) {
    try {
        await db
            .from('TranslationSuggestion')
            .update({ status: 'rejected' })
            .eq('id', id);
        return { success: true };
    } catch (error) {
        console.error("Failed to reject suggestion:", error);
        return { success: false, error };
    }
}

/**
 * Helper to prepare DB updates from payload
 */
function prepareModUpdates(updates: ModUpdatePayload, isQuickUpdate: boolean): Record<string, unknown> {
    const modFields = [
        'title', 'slug', 'version', 'author', 'description', 'status', 'gameVersion',
        'bannerUrl', 'isSaveBreaking', 'features', 'installationSteps', 'links', 'videos',
        'changelog', 'localizations', 'screenshots', 'createdAt', 'updatedAt'
    ];

    const dbUpdates: Record<string, unknown> = {};

    for (const field of modFields) {
        if (updates[field] !== undefined) {
            if (field === 'description' && isQuickUpdate) continue;

            let value = updates[field];

            if ((field === 'features' || field === 'installationSteps') && typeof value === 'string') {
                value = value.split('\n').map((s: string) => s.trim()).filter((s: string) => s !== '');
            }

            if ((field === 'createdAt' || field === 'updatedAt') && typeof value === 'string' && value.trim() !== '') {
                const date = new Date(value);
                if (!isNaN(date.getTime())) value = date.toISOString();
            } else if (value instanceof Date) {
                value = value.toISOString();
            }

            dbUpdates[field] = value;
        }
    }

    if (updates.stats) {
        dbUpdates.rating = updates.stats.rating;
        dbUpdates.ratingCount = updates.stats.ratingCount;
        dbUpdates.downloads = updates.stats.downloads;
        dbUpdates.views = updates.stats.views;
    }

    return dbUpdates;
}

/**
 * Handle News and Changelog for quick updates
 */
async function handleNewsCreation(
    targetSlug: string, 
    existingTitle: string, 
    existingGameVersion: string | undefined, 
    updates: ModUpdatePayload
): Promise<ModChangelogJson[] | null> {
    const tag = await findOrCreateNewscatTag(updates.eventType as string);
    const newsContent = Array.isArray(updates.changes)
        ? updates.changes.map((c: string) => `- ${c}`).join('\n')
        : updates.changes;

    const newsPromise = db.from('News').insert({
        modSlug: targetSlug,
        modName: existingTitle,
        modVersion: updates.version,
        gameVersion: existingGameVersion,
        actionText: updates.eventType || 'released',
        content: newsContent as string,
        description: updates.description || `${updates.version} Released`,
        date: updates.date ? new Date(updates.date).toISOString() : new Date().toISOString(),
        wipeRequired: updates.isSaveBreaking || false,
        sourceUrl: updates.sourceUrl || null,
        newscatTagId: tag.id,
        tags: [{ id: tag.id, displayName: tag.displayName, color: tag.color, category: tag.category }]
    });

    let newChangelog: ModChangelogJson[] | null = null;
    if (!updates.changelog) {
        newChangelog = [{
            version: updates.version as string,
            date: updates.date || new Date().toISOString(),
            changes: updates.changes as string[],
            isSaveBreaking: updates.isSaveBreaking as boolean
        }];
    }

    await newsPromise;
    return newChangelog;
}

/**
 * Orchestrates tag synchronization across all categories in parallel
 */
async function handleTagSyncing(targetSlug: string, updates: ModUpdatePayload, existingGameVersion?: string) {
    const tagIdsToLink: string[] = [];

    const syncStatus = async () => {
        const currentStatus = updates.status || (await db.from('Mod').select('status').eq('slug', targetSlug).maybeSingle())?.data?.status;
        if (currentStatus) {
            await removeModTagsByCategory(targetSlug, 'status');
            const statusTag = await findOrCreateStatusTag(currentStatus);
            return statusTag.id;
        }
        return undefined;
    };

    const syncAuthor = async () => {
        await removeModTagsByCategory(targetSlug, 'author');
        const authorTagsFromUpdates = updates.tags?.filter(t => t.category === 'author') || [];
        if (authorTagsFromUpdates.length === 0 && updates.author) {
            authorTagsFromUpdates.push({ displayName: updates.author, category: 'author' });
        }

        const ids: string[] = [];
        for (const authorData of authorTagsFromUpdates) {
            if (!authorData.displayName) continue;
            const authorTag = await findOrCreateAuthorTag(authorData.displayName);
            ids.push(authorTag.id);
            if (ids.length === 1) await db.from('Mod').update({ author: authorData.displayName }).eq('slug', targetSlug);
        }
        return ids;
    };

    const syncGameVer = async () => {
        const rawGameVersion = updates.gameVersion || existingGameVersion;
        if (!rawGameVersion) return;
        
        const gameVersion = normalizeGameVersion(rawGameVersion);
        if (gameVersion !== rawGameVersion) await db.from('Mod').update({ gameVersion }).eq('slug', targetSlug);
        
        await removeModTagsByCategory(targetSlug, 'gamever');
        let gameVerTag = await findOrCreateGameVerTag(gameVersion);
        
        if (!gameVerTag.color) {
            const { recalculateGameVersionColors } = await import('@/lib/tags');
            await recalculateGameVersionColors();
            gameVerTag = (await db.from('Tag').select('*').eq('id', gameVerTag.id).single()).data || gameVerTag;
        }
        return gameVerTag.id;
    };

    const syncManualTags = async () => {
        if (!updates.tags) return;
        await removeModTagsByCategory(targetSlug, 'tag');
        const manualTags = updates.tags.filter(t => t.category === 'tag' || !t.category);
        const ids: string[] = [];
        for (const tagData of manualTags) {
            if (!tagData.displayName) continue;
            const tag = await findOrCreateGenericTag(tagData.displayName);
            ids.push(tag.id);
        }
        return ids;
    };

    const syncLangTags = async () => {
        if (!updates.tags) return;
        await removeModTagsByCategory(targetSlug, 'lang');
        const langTags = updates.tags.filter(t => t.category === 'lang');
        for (const langData of langTags) {
            if (!langData.displayName) continue;
            const langTag = await findOrCreateLangTag(langData.displayName);
            await linkTagToModWithMetadata(targetSlug, langTag.id, {
                isExternal: langData.isExternal,
                externalLink: langData.externalLink
            });
        }
    };

    const results = await Promise.all([syncStatus(), syncAuthor(), syncGameVer(), syncManualTags(), syncLangTags()]);
    
    results.forEach(res => {
        if (Array.isArray(res)) tagIdsToLink.push(...res);
        else if (res) tagIdsToLink.push(res);
    });

    if (tagIdsToLink.length > 0) await batchLinkTagsToMod(targetSlug, tagIdsToLink);
}

export async function updateModAction(slug: string, updates: ModUpdatePayload): Promise<Result<void>> {
    const { data: existingMod } = await db.from('Mod').select('title, gameVersion, changelog, slug').eq('slug', slug).maybeSingle();
    
    let targetSlug = existingMod?.slug || slug;
    if (!existingMod) {
        const { data: approxMod } = await db.from('Mod').select('slug').ilike('slug', slug).maybeSingle();
        if (approxMod) targetSlug = approxMod.slug;
        else throw new Error(`Mod not found: ${slug}`);
    }

    const isQuickUpdate = !!updates.eventType;
    const dbUpdates = prepareModUpdates(updates, isQuickUpdate);

    // Parallelize News/Changelog and Database metadata update
    const newsTask = isQuickUpdate && updates.changes 
        ? handleNewsCreation(targetSlug, existingMod?.title || 'Unknown', existingMod?.gameVersion, updates)
        : Promise.resolve(null);

    const [newChangelog] = await Promise.all([newsTask]);
    
    if (newChangelog) {
        const currentChangelog = (existingMod?.changelog as unknown as ModChangelogJson[]) || [];
        dbUpdates.changelog = [...newChangelog, ...currentChangelog];
    }

    // Main DB update and Tag syncing in parallel
    await Promise.all([
        db.from('Mod').update(dbUpdates).eq('slug', targetSlug),
        handleTagSyncing(targetSlug, updates, existingMod?.gameVersion)
    ]);

    revalidatePath(ROUTES.mods);
    revalidatePath(`/${targetSlug}`);
    return ok(undefined);
}

export async function deleteModAction(slug: string) {
    await db.from('Mod').delete().eq('slug', slug);
    revalidatePath(ROUTES.mods);
}
