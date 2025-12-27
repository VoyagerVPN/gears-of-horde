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
export type ModLinksJson = ModLinks;
export type ModVideosJson = ModVideos;
export type ModChangelogJson = ModChangelog;
export type ModLocalizationJson = ModLocalization;

// ============================================================================
// PRISMA RESULT TYPES
// ============================================================================

/**
 * Tag with related tag data from ModTag/NewsTag join
 */
export interface PrismaTagWithRelation {
    isExternal?: boolean;
    externalLink?: string | null;
    tag: {
        id: string;
        category: string;
        value: string;
        displayName: string;
        color: string | null;
        isExternal?: boolean;
    };
}

/**
 * Mod with tags included from Prisma query
 */
export interface PrismaModWithTags {
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
    tags: PrismaTagWithRelation[];
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Tag with usage count from Prisma query
 */
export interface PrismaTagWithCount {
    id: string;
    category: string;
    value: string;
    displayName: string;
    color: string | null;
    _count: {
        modTags?: number;
    };
}

/**
 * News item with frozen snapshot data
 */
export interface PrismaNewsWithFrozenData {
    id: string;
    modSlug: string | null;
    modName: string | null;
    modVersion: string | null;
    gameVersion: string | null;
    actionText: string;
    content: string;
    description: string | null;
    date: Date;
    wipeRequired: boolean;
    sourceUrl: string | null;
    tags: unknown; // JSON array of frozen tag data
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Subscription with mod data from Prisma query
 */
export interface PrismaSubscriptionWithMod {
    id: string;
    userId: string;
    modSlug: string;
    subscribedAt: Date;
    lastViewedAt: Date;
    unseenVersions: number;
    mod: PrismaModWithTags;
}

/**
 * View history with mod data from Prisma query
 */
export interface PrismaViewHistoryWithMod {
    id: string;
    userId: string;
    modSlug: string;
    viewedAt: Date;
    mod: PrismaModWithTags;
}

/**
 * Download history with mod data from Prisma query
 */
export interface PrismaDownloadHistoryWithMod {
    id: string;
    userId: string;
    modSlug: string;
    version: string;
    downloadedAt: Date;
    sessionId: string;
    mod: PrismaModWithTags;
}

// ============================================================================
// MAPPING UTILITIES
// ============================================================================

/**
 * Map Prisma tag relation to TagData
 */
export function mapPrismaTagToTagData(mt: PrismaTagWithRelation): TagData {
    return {
        id: mt.tag.id,
        category: mt.tag.category,
        value: mt.tag.value,
        displayName: mt.tag.displayName,
        color: mt.tag.color,
        isExternal: mt.isExternal,
        externalLink: mt.externalLink ?? undefined
    };
}

/**
 * Map Prisma mod with tags to ModData
 */
export function mapPrismaModToModData(mod: PrismaModWithTags): import('@/schemas').ModData {
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
        tags: mod.tags.map(mapPrismaTagToTagData),
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
        createdAt: mod.createdAt.toISOString(),
        updatedAt: mod.updatedAt.toISOString()
    };
}

/**
 * Map Prisma tag with count to TagData
 */
export function mapPrismaTagWithCountToTagData(tag: PrismaTagWithCount): TagData {
    return {
        id: tag.id,
        category: tag.category,
        value: tag.value,
        displayName: tag.displayName,
        color: tag.color,
        usageCount: tag._count.modTags ?? 0
    };
}

// ============================================================================
// JSON UTILITIES
// ============================================================================

/**
 * Type for JSON fields in Prisma models
 * Use this instead of 'as any' for JSON field casting
 */
export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
