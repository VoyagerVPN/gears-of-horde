import { z } from 'zod';

// ============================================================================
// NEWS SCHEMAS
// ============================================================================

/**
 * Schema for frozen tag data stored in News JSON column
 */
export const FrozenTagSchema = z.object({
    id: z.string().optional(),        // Optional reference to Tag table for live data lookup
    displayName: z.string(),
    color: z.string().optional(),
    category: z.string().optional()
});

/**
 * Schema for news item data (frozen snapshot)
 */
export const NewsItemSchema = z.object({
    id: z.string().min(1),
    modSlug: z.string().optional(),
    modName: z.string().min(1),
    modVersion: z.string().optional(),
    gameVersion: z.string().optional(),
    actionText: z.string().default("released"),
    content: z.string(),
    description: z.string().optional(),
    date: z.string(),
    tags: z.array(FrozenTagSchema).default([]),
    wipeRequired: z.boolean().default(false),
    sourceUrl: z.string().url().optional().or(z.literal('')),
    // Tag references for live data lookup (colors, etc.)
    newscatTagId: z.string().optional(),
    gameVersionTagId: z.string().optional()
});

/**
 * Schema for creating news items
 */
export const NewsCreateSchema = z.object({
    modSlug: z.string().optional(),
    modName: z.string().min(1, "Mod name is required"),
    modVersion: z.string().optional(),
    gameVersion: z.string().optional(),
    actionText: z.string().default("released"),
    content: z.string().min(1, "Content is required"),
    description: z.string().optional(),
    date: z.date().optional(),
    wipeRequired: z.boolean().default(false),
    sourceUrl: z.string().url("Invalid source URL").optional().or(z.literal('')),
    tags: z.array(FrozenTagSchema).default([])
});

/**
 * Schema for updating news items
 */
export const NewsUpdateSchema = NewsCreateSchema.partial();

// ============================================================================
// INFERRED TYPES
// ============================================================================

export type FrozenTag = z.infer<typeof FrozenTagSchema>;
export type NewsItem = z.infer<typeof NewsItemSchema>;
export type NewsCreate = z.infer<typeof NewsCreateSchema>;
export type NewsUpdate = z.infer<typeof NewsUpdateSchema>;
