import { z } from 'zod';
import {
    ModLinksSchema,
    ModVideosSchema,
    ModChangelogSchema,
    ModLocalizationSchema,
    TagDataSchema
} from './mod.schema';

// ============================================================================
// MOD SUBMISSION SCHEMAS
// ============================================================================

/**
 * Schema for mod submission (user-submitted mods pending review)
 */
export const ModSubmissionSchema = z.object({
    id: z.string(),
    title: z.string().min(1, "Title is required").max(100),
    slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
    version: z.string().min(1),
    author: z.string().min(1),
    description: z.string(),
    gameVersion: z.string().min(1),
    bannerUrl: z.string().url().optional().or(z.literal('')),
    isSaveBreaking: z.boolean().default(false),
    features: z.array(z.string()).default([]),
    installationSteps: z.array(z.string()).default([]),
    links: ModLinksSchema,
    videos: ModVideosSchema,
    changelog: z.array(ModChangelogSchema).default([]),
    localizations: z.array(ModLocalizationSchema).default([]),
    screenshots: z.array(z.string().url()).default([]),
    tags: z.array(TagDataSchema).default([]),

    // Submitter info
    submitterId: z.string(),
    submitterName: z.string(),
    submitterImage: z.string().url().optional(),
    submitterNote: z.string().max(500).optional(),

    // Status
    status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
    rejectionReason: z.string().optional(),
    submittedAt: z.string(),
    reviewedAt: z.string().optional()
});

/**
 * Schema for creating a new mod submission
 * Excludes auto-generated fields
 */
export const ModSubmissionCreateSchema = ModSubmissionSchema.omit({
    id: true,
    submitterId: true,
    submitterName: true,
    submitterImage: true,
    status: true,
    submittedAt: true,
    reviewedAt: true,
    rejectionReason: true
});

/**
 * Schema for translation suggestion
 */
export const TranslationSuggestionSchema = z.object({
    id: z.string(),
    modSlug: z.string().min(1),
    modName: z.string().min(1),
    author: z.string().min(1),
    link: z.string().url("Invalid link URL"),
    languageCode: z.string().min(1),
    languageName: z.string().min(1),
    status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
    submittedAt: z.string()
});

// ============================================================================
// INFERRED TYPES
// ============================================================================

export type ModSubmission = z.infer<typeof ModSubmissionSchema>;
export type ModSubmissionCreate = z.infer<typeof ModSubmissionCreateSchema>;
export type TranslationSuggestion = z.infer<typeof TranslationSuggestionSchema>;
