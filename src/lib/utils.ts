/**
 * Utility Functions
 */

// ============================================================================
// GAME VERSION UTILITIES
// ============================================================================

/**
 * Normalize game version to always have "V" prefix
 * Examples:
 *   "2.2" → "V2.2"
 *   "v2.2" → "V2.2"
 *   "V2.2" → "V2.2"
 *   "1.0" → "V1.0"
 */
export function normalizeGameVersion(version: string): string {
    if (!version) return version;

    // Remove any existing V/v prefix, then add uppercase V
    const cleaned = version.trim().replace(/^[vV]/, '');
    return `V${cleaned}`;
}

/**
 * Convert game version to tag value format for database storage
 * Examples:
 *   "V2.2" → "2_2"
 *   "2.2" → "2_2"
 *   "v1.0" → "1_0"
 */
export function gameVersionToTagValue(version: string): string {
    if (!version) return version;

    return version
        .trim()
        .replace(/^[vV]/, '')  // Remove V prefix
        .replace(/\./g, '_');   // Replace dots with underscores
}

/**
 * Compare two game versions (e.g. "V1.0" vs "V1.1")
 * Returns: < 0 if v1 < v2, 0 if v1 == v2, > 0 if v1 > v2
 */
export function compareGameVersions(v1: string, v2: string): number {
    const v1Clean = (v1 || '').replace(/^[vV]/, '');
    const v2Clean = (v2 || '').replace(/^[vV]/, '');
    const v1Parts = v1Clean.split('.').map(Number);
    const v2Parts = v2Clean.split('.').map(Number);

    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
        const p1 = v1Parts[i] || 0;
        const p2 = v2Parts[i] || 0;
        if (p1 !== p2) return p1 - p2;
    }
    return 0;
}

/**
 * Get the latest game version from a list of tags
 */
export function getLatestGameVersion(tags: { displayName: string }[], defaultVersion = 'V1.4'): string {
    if (!tags || tags.length === 0) return defaultVersion;

    const sorted = [...tags].sort((a, b) => compareGameVersions(b.displayName, a.displayName));
    return sorted[0]?.displayName || defaultVersion;
}

/**
 * Calculate the gradient color for a game version based on its position among all versions.
 * Uses the same red-to-green gradient as the server-side recalculateGameVersionColors.
 * 
 * @param version - The version to calculate color for (e.g., "V2.6")
 * @param allVersions - List of all versions (including the new one)
 * @returns Hex color string
 */
export function calculateGameVersionColor(
    version: string,
    allVersions: string[]
): string {
    const OLDEST_COLOR = '#ef4444'; // red-500
    const NEWEST_COLOR = '#22c55e'; // green-500

    if (allVersions.length === 0) return NEWEST_COLOR;
    if (allVersions.length === 1) return NEWEST_COLOR;

    // Sort versions oldest to newest
    const sorted = [...allVersions].sort((a, b) => compareGameVersions(a, b));

    // Find position of this version
    const index = sorted.findIndex(v => v === version);
    if (index === -1) return NEWEST_COLOR;

    const count = sorted.length;
    const ratio = index / (count - 1);

    // Interpolate between red and green
    const startR = parseInt(OLDEST_COLOR.slice(1, 3), 16);
    const startG = parseInt(OLDEST_COLOR.slice(3, 5), 16);
    const startB = parseInt(OLDEST_COLOR.slice(5, 7), 16);
    const endR = parseInt(NEWEST_COLOR.slice(1, 3), 16);
    const endG = parseInt(NEWEST_COLOR.slice(3, 5), 16);
    const endB = parseInt(NEWEST_COLOR.slice(5, 7), 16);

    const r = Math.round(startR + (endR - startR) * ratio);
    const g = Math.round(startG + (endG - startG) * ratio);
    const b = Math.round(startB + (endB - startB) * ratio);

    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// ============================================================================
// GENERAL UTILITIES
// ============================================================================

// Classname merging utility
export function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(' ');
}

// URL validation
export function isValidUrl(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

// Domain extraction from URL
export function getDomain(url: string): string {
    try {
        return new URL(url).hostname;
    } catch {
        return "";
    }
}

// Number formatting (e.g., 1500 -> 1.5K)
export function formatNumber(num: number): string {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num.toString();
}

// Truncate text with ellipsis
export function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
}

// Slugify string with Russian transliteration
export function slugify(text: string): string {
    const ru: { [key: string]: string } = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
        'з': 'z', 'и': 'i', 'й': 'j', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
        'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'c',
        'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu',
        'я': 'ya'
    };

    return text
        .toString()
        .toLowerCase()
        .trim()
        .split('')
        .map(char => ru[char] || char)
        .join('')
        .replace(/\s+/g, '-')        // Replace spaces with -
        .replace(/[^-a-z0-9]+/g, '') // Remove all non-alphanumeric (latin only) and non-hyphen chars
        .replace(/-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')          // Trim - from start of text
        .replace(/-+$/, '');         // Trim - from end of text
}
