import { z } from 'zod';

// ============================================================================
// TAG MANAGEMENT SCHEMAS
// ============================================================================

/**
 * Valid tag categories in the system
 */
export const TagCategorySchema = z.enum([
    'gamever',  // Game version tags
    'author',   // Author tags
    'lang',     // Language tags
    'status',   // Mod status tags
    'newscat',  // News category tags
    'tag'       // Generic tags
]);

/**
 * Schema for creating a new tag
 */
export const TagCreateSchema = z.object({
    category: z.string().min(1, "Category is required"),
    value: z.string().min(1, "Value is required")
        .regex(/^[a-z0-9_-]+$/i, "Value must be alphanumeric with underscores/hyphens"),
    displayName: z.string().min(1, "Display name is required").max(50, "Display name too long"),
    color: z.string()
        .regex(/^#[0-9a-fA-F]{6}$/, "Color must be a valid hex color (e.g., #FF5500)")
        .optional()
});

/**
 * Schema for updating an existing tag
 */
export const TagUpdateSchema = z.object({
    category: z.string().min(1).optional(),
    value: z.string().min(1)
        .regex(/^[a-z0-9_-]+$/i, "Value must be alphanumeric with underscores/hyphens")
        .optional(),
    displayName: z.string().min(1).max(50).optional(),
    color: z.string()
        .regex(/^#[0-9a-fA-F]{6}$/, "Invalid hex color")
        .optional()
        .nullable()
});

/**
 * Schema for merging tags
 */
export const TagMergeSchema = z.object({
    sourceId: z.string().min(1, "Source tag ID required"),
    targetId: z.string().min(1, "Target tag ID required")
}).refine(
    data => data.sourceId !== data.targetId,
    { message: "Cannot merge a tag with itself", path: ["targetId"] }
);

/**
 * Schema for category operations
 */
export const CategoryRenameSchema = z.object({
    oldCategory: z.string().min(1, "Old category name required"),
    newCategory: z.string().min(1, "New category name required")
}).refine(
    data => data.oldCategory !== data.newCategory,
    { message: "New category must be different from old category", path: ["newCategory"] }
);

// ============================================================================
// INFERRED TYPES
// ============================================================================

export type TagCategory = z.infer<typeof TagCategorySchema>;
export type TagCreate = z.infer<typeof TagCreateSchema>;
export type TagUpdate = z.infer<typeof TagUpdateSchema>;
export type TagMerge = z.infer<typeof TagMergeSchema>;
export type CategoryRename = z.infer<typeof CategoryRenameSchema>;
