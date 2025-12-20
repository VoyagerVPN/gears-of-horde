/**
 * Mod Types
 * 
 * CONSOLIDATED: All types are now derived from Zod schemas.
 * This file re-exports for backwards compatibility.
 * 
 * For new code, prefer importing directly from '@/schemas'.
 */

// Re-export all mod-related types from schemas (single source of truth)
export type {
    ModData,
    ModLink,
    ModLinks,
    ModVideos,
    ModChangelog,
    ModLocalization,
    ModStats,
    ModStatusType,
    TagData,
    ModSubmission,
    TranslationSuggestion,
    NewsItem
} from '@/schemas';

