import { z } from 'zod';

// ============================================================================
// USER/PROFILE SCHEMAS
// ============================================================================

/**
 * Schema for user bio update
 */
export const UserBioUpdateSchema = z.object({
    bio: z.string()
        .max(500, "Bio cannot exceed 500 characters")
        .transform(val => val.trim())
});

/**
 * Schema for recording a download
 */
export const RecordDownloadSchema = z.object({
    modSlug: z.string().min(1, "Mod slug is required"),
    version: z.string().min(1, "Version is required"),
    sessionId: z.string().min(1, "Session ID is required")
});

/**
 * Schema for recording a view
 */
export const RecordViewSchema = z.object({
    modSlug: z.string().min(1, "Mod slug is required")
});

/**
 * Schema for subscription toggle
 */
export const SubscriptionToggleSchema = z.object({
    modSlug: z.string().min(1, "Mod slug is required")
});

/**
 * Schema for pagination parameters
 */
export const PaginationSchema = z.object({
    page: z.number().int().min(1).default(1),
    pageSize: z.number().int().min(1).max(100).default(20)
});

// ============================================================================
// INFERRED TYPES
// ============================================================================

export type UserBioUpdate = z.infer<typeof UserBioUpdateSchema>;
export type RecordDownload = z.infer<typeof RecordDownloadSchema>;
export type RecordView = z.infer<typeof RecordViewSchema>;
export type SubscriptionToggle = z.infer<typeof SubscriptionToggleSchema>;
export type Pagination = z.infer<typeof PaginationSchema>;
