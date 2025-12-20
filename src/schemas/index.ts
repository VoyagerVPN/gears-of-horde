/**
 * Centralized Schema Exports
 * 
 * All Zod schemas and inferred types are exported from here.
 * Import from '@/schemas' to access any schema or type.
 */

// Mod schemas and types
export {
    ModLinkSchema,
    ModLinksSchema,
    ModVideosSchema,
    ModChangelogSchema,
    ModLocalizationSchema,
    ModStatsSchema,
    ModStatusSchema,
    TagDataSchema,
    ModDataSchema,
    ModUpdateSchema,
    ModCreateSchema,
    // Types
    type ModData,
    type ModUpdate,
    type ModCreate,
    type ModLink,
    type ModLinks,
    type ModVideos,
    type ModChangelog,
    type ModLocalization,
    type ModStats,
    type ModStatusType,
    type TagData
} from './mod.schema';

// News schemas and types
export {
    NewsItemSchema,
    NewsCreateSchema,
    NewsUpdateSchema,
    // Types
    type NewsItem,
    type NewsCreate,
    type NewsUpdate
} from './news.schema';

// Submission schemas and types
export {
    ModSubmissionSchema,
    ModSubmissionCreateSchema,
    TranslationSuggestionSchema,
    // Types
    type ModSubmission,
    type ModSubmissionCreate,
    type TranslationSuggestion
} from './submission.schema';

// Tag management schemas and types
export {
    TagCategorySchema,
    TagCreateSchema,
    TagUpdateSchema,
    TagMergeSchema,
    CategoryRenameSchema,
    // Types
    type TagCategory,
    type TagCreate,
    type TagUpdate,
    type TagMerge,
    type CategoryRename
} from './tag.schema';

// Profile schemas and types
export {
    UserBioUpdateSchema,
    RecordDownloadSchema,
    RecordViewSchema,
    SubscriptionToggleSchema,
    PaginationSchema,
    // Types
    type UserBioUpdate,
    type RecordDownload,
    type RecordView,
    type SubscriptionToggle,
    type Pagination
} from './profile.schema';

