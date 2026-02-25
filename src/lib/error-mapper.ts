/**
 * Database Error Types for Mapping
 */
export enum DbErrorCode {
    UNIQUE_VIOLATION = '23505',
    FOREIGN_KEY_VIOLATION = '23503',
    CHECK_VIOLATION = '23CHECK', // Custom mapping for Check constraints if needed
    NOT_NULL_VIOLATION = '23502',
}

/**
 * Maps PostgreSQL/Supabase error codes to user-friendly i18n keys.
 */
export function mapDbError(error: any): string {
    if (!error) return 'errors.unknown';

    const code = error.code || '';
    const message = error.message || '';

    // Handle standard Postgres codes
    switch (code) {
        case DbErrorCode.UNIQUE_VIOLATION:
            if (message.includes('slug')) return 'errors.mod.slug_exists';
            if (message.includes('email')) return 'errors.user.email_exists';
            return 'errors.db.duplicate_entry';
            
        case DbErrorCode.FOREIGN_KEY_VIOLATION:
            return 'errors.db.reference_missing';
            
        case DbErrorCode.NOT_NULL_VIOLATION:
            return 'errors.db.missing_required_field';

        default:
            // Log the unknown code for future mapping
            if (code) {
                console.warn(`Unmapped DB error code: ${code}`, message);
            }
            return 'errors.db.generic_transaction_failed';
    }
}
