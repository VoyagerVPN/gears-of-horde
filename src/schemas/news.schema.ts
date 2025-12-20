import { z } from 'zod';
import { TagDataSchema } from './mod.schema';

// ============================================================================
// NEWS SCHEMAS
// ============================================================================

/**
 * Schema for news item data
 */
export const NewsItemSchema = z.object({
    id: z.string().min(1),
    modSlug: z.string().min(1),
    modName: z.string().min(1),
    description: z.string(),
    date: z.string(),
    tags: z.array(TagDataSchema).default([]),
    gameVersion: z.string().optional(),
    isSaveBreaking: z.boolean().optional(),
    sourceUrl: z.string().url().optional().or(z.literal(''))
});

/**
 * Schema for creating news items
 */
export const NewsCreateSchema = z.object({
    title: z.string().min(1, "Title is required").max(200, "Title too long"),
    content: z.string().min(1, "Content is required"),
    date: z.date().optional(),
    wipeRequired: z.boolean().default(false),
    sourceUrl: z.string().url("Invalid source URL").optional().or(z.literal('')),
    modId: z.string().optional(),
    tagIds: z.array(z.string()).default([])
});

/**
 * Schema for updating news items
 */
export const NewsUpdateSchema = NewsCreateSchema.partial();

// ============================================================================
// INFERRED TYPES
// ============================================================================

export type NewsItem = z.infer<typeof NewsItemSchema>;
export type NewsCreate = z.infer<typeof NewsCreateSchema>;
export type NewsUpdate = z.infer<typeof NewsUpdateSchema>;
