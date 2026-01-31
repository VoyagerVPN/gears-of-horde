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

// ============================================================================
// INFERRED TYPES
// ============================================================================

export type UserBioUpdate = z.infer<typeof UserBioUpdateSchema>;
