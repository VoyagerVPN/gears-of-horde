/**
 * Centralized Schema Exports
 * 
 * All Zod schemas and inferred types are exported from here.
 * Import from '@/schemas' to access any schema or type.
 */

// Mod schemas and types
export {
    ModDataSchema,
    // Types
    type ModData,
    type ModStatusType,
    type TagData
} from './mod.schema';

// News schemas and types
export {
    // Types
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
} from './tag.schema';

// Profile schemas and types
export {
    UserBioUpdateSchema,
    // Types
} from './profile.schema';
