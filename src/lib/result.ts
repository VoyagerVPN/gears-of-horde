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

    // Get the first error message for simple display
    const firstError = result.error.issues[0]?.message ?? 'Validation failed';

    // Flatten field errors for form integration
    const fieldErrors = result.error.flatten().fieldErrors as Record<string, string[]>;

    return err(firstError, fieldErrors);
}

/**
 * Parse data with a Zod schema, throwing on error
 * Use this when you want to fail fast
 */
export function parseOrThrow<T>(schema: z.ZodSchema<T>, data: unknown): T {
    return schema.parse(data);
}

/**
 * Safely parse data with a Zod schema
 * Returns the data or null on failure
 */
export function parseOrNull<T>(schema: z.ZodSchema<T>, data: unknown): T | null {
    const result = schema.safeParse(data);
    return result.success ? result.data : null;
}

// ============================================================================
// ERROR UTILITIES
// ============================================================================

/**
 * Format Zod errors into user-friendly messages
 */
export function formatZodError(error: z.ZodError): string {
    return error.issues
        .map((issue) => {
            const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : '';
            return `${path}${issue.message}`;
        })
        .join('; ');
}

/**
 * Extract field-specific errors from a Result
 */
export function getFieldError(
    result: Result<unknown>,
    field: string
): string | undefined {
    if (result.success) return undefined;
    return result.fieldErrors?.[field]?.[0];
}
