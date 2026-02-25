/**
 * Database Types
 * 
 * Prisma query result types and mapping utilities.
 * JSON field types are imported from schemas (single source of truth).
 */

import {
    ModStatusType,
    TagData,
    type ModLinks,
    type ModVideos,
    type ModChangelog,
    type ModLocalization
} from '@/schemas';

// Re-export JSON types for backwards compatibility
export type { ModLinks, ModVideos, ModChangelog, ModLocalization } from '@/schemas';

// Legacy aliases (deprecated - use schema types directly)
export type ModChangelogJson = ModChangelog;
export type ModLocalizationJson = ModLocalization;

// ============================================================================
// DATABASE RESULT TYPES (Generic)
// ============================================================================

/**
 * Tag with related tag data
 */
export interface DatabaseTagWithRelation {
    isExternal?: boolean;
    externalLink?: string | null;
    tag: {
        id: string;
        category: string;
        value: string;
        displayName: string;
        color: string | null;
        weight: number | null;
    };
}

/**
 * Mod with tags included
 */
export interface DatabaseModWithTags {
    slug: string;
    title: string;
    version: string;
    author: string;
    authorId: string | null;
    description: string;
    status: string;
    gameVersion: string;
    bannerUrl: string | null;
    isSaveBreaking: boolean;
    features: string[];
    installationSteps: string[];
    links: unknown;
    videos: unknown;
    changelog: unknown;
    localizations: unknown;
    rating: number;
    ratingCount: number;
    downloads: string;
    views: string;
    screenshots: string[];
    tags: DatabaseTagWithRelation[];
    createdAt: string | Date;
    updatedAt: string | Date;
}

/**
 * Tag with usage count
 */
export interface DatabaseTagWithCount {
    id: string;
    category: string;
    value: string;
    displayName: string;
    color: string | null;
    isExternal?: boolean;
    modTags: { count: number }[];
}

/**
 * News item with frozen snapshot data
 */
export interface DatabaseNewsWithFrozenData {
    id: string;
    modSlug: string | null;
    modName: string | null;
    modVersion: string | null;
    gameVersion: string | null;
    actionText: string;
    content: string;
    description: string | null;
    date: string | Date;
    wipeRequired: boolean;
    sourceUrl: string | null;
    tags: unknown; // JSON array of frozen tag data
    createdAt: string | Date;
    updatedAt: string | Date;
}

/**
 * Subscription with mod data
 */
export interface DatabaseSubscriptionWithMod {
    id: string;
    userId: string;
    modSlug: string;
    subscribedAt: string | Date;
    lastViewedAt: string | Date;
    unseenVersions: number;
    mod: DatabaseModWithTags;
}

/**
 * View history with mod data
 */
export interface DatabaseViewHistoryWithMod {
    id: string;
    userId: string;
    modSlug: string;
    viewedAt: string | Date;
    mod: DatabaseModWithTags;
}

/**
 * Download history with mod data
 */
export interface DatabaseDownloadHistoryWithMod {
    id: string;
    userId: string;
    modSlug: string;
    version: string;
    downloadedAt: string | Date;
    sessionId: string;
    mod: DatabaseModWithTags;
}

// ============================================================================
// MAPPING UTILITIES
// ============================================================================

/**
 * Map Database tag relation to TagData
 */
export function mapDatabaseTagToTagData(mt: DatabaseTagWithRelation): TagData {
    return {
        id: mt.tag.id,
        category: mt.tag.category,
        value: mt.tag.value,
        displayName: mt.tag.displayName,
        color: mt.tag.color,
        weight: mt.tag.weight ?? undefined,
        isExternal: mt.isExternal,
        externalLink: mt.externalLink ?? undefined
    };
}

/**
 * Map Database mod with tags to ModData
 */
export function mapDatabaseModToModData(mod: DatabaseModWithTags): import('@/schemas').ModData {
    const toDate = (d: string | Date) => typeof d === 'string' ? d : d.toISOString();

    return {
        slug: mod.slug,
        title: mod.title,
        version: mod.version,
        author: mod.author,
        description: mod.description,
        status: mod.status as ModStatusType,
        gameVersion: mod.gameVersion,
        bannerUrl: mod.bannerUrl ?? '',
        isSaveBreaking: mod.isSaveBreaking,
        features: mod.features,
        tags: mod.tags.map(mapDatabaseTagToTagData),
        installationSteps: mod.installationSteps,
        links: (mod.links as ModLinks) ?? { download: '', discord: '', community: [], donations: [] },
        videos: (mod.videos as ModVideos) ?? { trailer: '', review: '' },
        screenshots: mod.screenshots,
        changelog: (mod.changelog as ModChangelog[]) ?? [],
        localizations: (mod.localizations as ModLocalization[]) ?? [],
        stats: {
            rating: mod.rating,
            ratingCount: mod.ratingCount,
            downloads: mod.downloads,
            views: mod.views
        },
        createdAt: toDate(mod.createdAt),
        updatedAt: toDate(mod.updatedAt)
    };
}

/**
 * Map Database tag with count to TagData
 */
export function mapDatabaseTagWithCountToTagData(tag: DatabaseTagWithCount): TagData {
    return {
        id: tag.id,
        category: tag.category,
        value: tag.value,
        displayName: tag.displayName,
        color: tag.color,
        isExternal: tag.isExternal ?? false,
        usageCount: tag.modTags?.[0]?.count ?? 0
    };
}


// ============================================================================
// JSON UTILITIES
// ============================================================================

