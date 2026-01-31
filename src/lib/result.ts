import { z } from 'zod';

// ============================================================================
// RESULT TYPE
// ============================================================================

/**
 * Discriminated union for type-safe error handling in server actions
 */
export type Result<T, E = string> =
    | { success: true; data: T }
    | { success: false; error: E; fieldErrors?: Record<string, string[]> };

/**
 * Create a successful result
 */
export function ok<T>(data: T): Result<T> {
    return { success: true, data };
}

/**
 * Create an error result
 */
export function err<E = string>(
    error: E,
    fieldErrors?: Record<string, string[]>
): Result<never, E> {
    return { success: false, error, fieldErrors };
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate data against a Zod schema and return a Result
 */
export function validate<T>(
    schema: z.ZodSchema<T>,
    data: unknown
): Result<T> {
    const result = schema.safeParse(data);

    if (result.success) {
        return ok(result.data);
    }

    // Get all unique error messages with field paths for context
    const allErrors = [...new Set(result.error.issues.map(issue => {
        const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : '';
        return `${path}${issue.message}`;
    }))];

    // Flatten field errors for form integration
    const fieldErrors = result.error.flatten().fieldErrors as Record<string, string[]>;

    return err(allErrors.join('\n'), fieldErrors);
}

/**
 * Safely parse data with a Zod schema
 * Returns the data or null on failure
 */
export function parseOrNull<T>(schema: z.ZodSchema<T>, data: unknown): T | null {
    const result = schema.safeParse(data);
    return result.success ? result.data : null;
}
