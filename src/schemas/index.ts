/**
 * Centralized Schema Exports
 * 
 * All Zod schemas and inferred types are exported from here.
 * Import from '@/schemas' to access any schema or type.
 */

// Mod schemas and types
export {
    ModDataSchema,
    ModChangelogSchema,
    ModLocalizationSchema,
    ModStatusSchema,
    TagDataSchema,
    // Types
    type ModData,
    type ModStatusType,
    type TagData,
    type ModChangelog,
    type ModLocalization,
    type ModUpdate,
    type ModCreate,
    type ModStats,
    type ModLinks,
    type ModVideos,
    type ModLink
} from './mod.schema';

// News schemas and types
export {
    NewsItemSchema,
    NewsCreateSchema,
    NewsUpdateSchema,
    // Types
    type NewsItem,
    type NewsCreate,
    type NewsUpdate,
    type FrozenTag
} from './news.schema';

// Submission schemas and types
export {
    ModSubmissionCreateSchema,
    // Types
    type ModSubmission,
    type TranslationSuggestion
} from './submission.schema';

// Tag management schemas and types
export {
    TagCreateSchema,
    TagUpdateSchema,
    TagMergeSchema,
    // Types
    type TagCreate,
    type TagUpdate,
    type TagMerge
} from './tag.schema';

// Profile schemas and types
export {
    UserBioUpdateSchema,
    // Types
    type UserBioUpdate
} from './profile.schema';
