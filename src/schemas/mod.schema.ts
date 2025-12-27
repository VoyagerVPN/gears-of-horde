import { z } from 'zod';

// ============================================================================
// REUSABLE SUB-SCHEMAS
// ============================================================================

/**
 * Schema for external links (community, donations)
 */
export const ModLinkSchema = z.object({
    name: z.string().min(1, "Link name is required"),
    url: z.string().url("Invalid URL format")
});

/**
 * Schema for mod links section
 */
export const ModLinksSchema = z.object({
    download: z.string().url("Invalid download URL").or(z.literal('')),
    discord: z.string().url("Invalid Discord URL").or(z.literal('')),
    community: z.array(ModLinkSchema).default([]),
    donations: z.array(ModLinkSchema).default([])
});

/**
 * Schema for mod video links
 */
export const ModVideosSchema = z.object({
    trailer: z.string().url("Invalid trailer URL").or(z.literal('')),
    review: z.string().url("Invalid review URL").or(z.literal(''))
});

/**
 * Schema for changelog entries
 */
export const ModChangelogSchema = z.object({
    version: z.string().min(1, "Version is required"),
    date: z.string().min(1, "Date is required"),
    changes: z.array(z.string()),
    isSaveBreaking: z.boolean().optional()
});

/**
 * Schema for localization entries
 */
export const ModLocalizationSchema = z.object({
    code: z.string().min(1, "Language code is required"),
    name: z.string().min(1, "Language name is required"),
    type: z.enum(['builtin', 'external']),
    url: z.string().url().optional()
});

/**
 * Schema for mod stats
 */
export const ModStatsSchema = z.object({
    rating: z.number().min(0).max(5).default(0),
    ratingCount: z.number().int().min(0).default(0),
    downloads: z.string().default("0"),
    views: z.string().default("0")
});

/**
 * Valid mod status values
 */
export const ModStatusSchema = z.enum([
    'active', 'on_hold', 'discontinued', 'upcoming', 'unknown'
]);

// ============================================================================
// TAG SCHEMA
// ============================================================================

/**
 * Schema for tag data used throughout the application
 */
export const TagDataSchema = z.object({
    id: z.string().optional(),
    value: z.string().optional(),
    displayName: z.string().min(1, "Display name is required").max(25, "Display name too long (max 25 characters)"),
    color: z.string().nullable().optional(),
    category: z.string().optional(),
    usageCount: z.number().int().optional(),
    isExternal: z.boolean().optional(),
    externalLink: z.string().url("Invalid external link URL").optional().or(z.literal(''))
});

// ============================================================================
// MAIN MOD SCHEMA
// ============================================================================

/**
 * Complete mod data schema for validation
 */
export const ModDataSchema = z.object({
    title: z.string().min(1, "Title is required").max(100, "Title too long"),
    slug: z.string()
        .min(1, "Slug is required")
        .max(50, "Slug too long")
        .regex(/^[a-z0-9-]+$/, "Slug can only contain Latin letters, numbers, and hyphens"),
    version: z.string().min(1, "Version is required"),
    author: z.string(),
    description: z.string().refine(
        (val) => val.trim().split(/\s+/).filter(word => word.length > 0).length >= 5,
        "Description must contain at least 5 words"
    ),
    status: ModStatusSchema.default('active'),
    gameVersion: z.string().min(1, "Game version is required"),
    bannerUrl: z.string().min(1, "Banner is required").url("Invalid banner URL"),
    isSaveBreaking: z.boolean().default(false),
    features: z.array(z.string()).default([]),
    tags: z.array(TagDataSchema).refine(
        (tags) => tags.filter(t => t.category !== 'lang' && t.category !== 'gamever').length >= 1,
        "At least one tag is required"
    ),
    installationSteps: z.array(z.string()).default([]),
    links: ModLinksSchema.default({
        download: '',
        discord: '',
        community: [],
        donations: []
    }),
    stats: ModStatsSchema.default({
        rating: 0,
        ratingCount: 0,
        downloads: "0",
        views: "0"
    }),
    videos: ModVideosSchema.default({ trailer: '', review: '' }),
    screenshots: z.array(z.string().url("Invalid screenshot URL")).min(1, "At least one screenshot is required"),
    changelog: z.array(ModChangelogSchema).default([]),
    localizations: z.array(ModLocalizationSchema).default([]),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional()
}).refine(data => {
    const hasAuthorTag = data.tags.some(t => t.category === 'author');
    return data.author.trim().length > 0 || hasAuthorTag;
}, {
    message: "Author is required",
    path: ["author"]
});

/**
 * Partial mod schema for updates (all fields optional)
 */
export const ModUpdateSchema = ModDataSchema.partial();

/**
 * Schema for mod creation (slug is auto-generated from title)
 */
export const ModCreateSchema = ModDataSchema.omit({
    createdAt: true,
    updatedAt: true,
    stats: true
}).extend({
    stats: ModStatsSchema.optional()
});

// ============================================================================
// INFERRED TYPES
// ============================================================================

export type ModData = z.infer<typeof ModDataSchema>;
export type ModUpdate = z.infer<typeof ModUpdateSchema>;
export type ModCreate = z.infer<typeof ModCreateSchema>;
export type ModLink = z.infer<typeof ModLinkSchema>;
export type ModLinks = z.infer<typeof ModLinksSchema>;
export type ModVideos = z.infer<typeof ModVideosSchema>;
export type ModChangelog = z.infer<typeof ModChangelogSchema>;
export type ModLocalization = z.infer<typeof ModLocalizationSchema>;
export type ModStats = z.infer<typeof ModStatsSchema>;
export type ModStatusType = z.infer<typeof ModStatusSchema>;
export type TagData = z.infer<typeof TagDataSchema>;
