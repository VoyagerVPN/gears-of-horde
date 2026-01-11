/**
 * Utility Functions
 */

// ============================================================================
// GAME VERSION UTILITIES
// ============================================================================

/**
 * Normalize game version format
 * Examples:
 *   "2.2" → "V2.2"
 *   "v2.2" → "V2.2"
 *   "V2.2" → "V2.2"
 *   "a20" → "A20"
 *   "A21" → "A21"
 *   "v1.1b14" → "V1.1b14"
 *   "N/A" → "N/A"
 */
export function normalizeGameVersion(version: string): string {
    if (!version) return version;

    const trimmed = version.trim();

    // N/A is special case - keep as-is
    if (trimmed.toUpperCase() === 'N/A') return 'N/A';

    // Fix: VA21 -> A21 (strip V if followed by A)
    let cleaned = trimmed;
    if (cleaned.match(/^[vV][aA]\d+/)) {
        cleaned = cleaned.substring(1);
    }

    // Alpha versions (A20, a21, etc.)
    if (cleaned.match(/^[aA]\d+/)) {
        return cleaned.toUpperCase();
    }

    // V versions (with or without build number)
    // Remove any existing V/v prefix
    cleaned = cleaned.replace(/^[vV]/, '');

    // Only add 'V' if it looks like a version number (starts with digit)
    if (/^\d/.test(cleaned)) {
        return `V${cleaned}`;
    }

    // Otherwise return as is (e.g. "Unknown", "Custom")
    return cleaned;
}

/**
 * Convert game version to tag value format for database storage
 * Examples:
 *   "V2.2" → "2_2"
 *   "A20" → "a20"
 *   "V1.1b14" → "1_1b14"
 *   "N/A" → "na"
 */
export function gameVersionToTagValue(version: string): string {
    if (!version) return version;

    const trimmed = version.trim();

    // N/A special case
    if (trimmed.toUpperCase() === 'N/A') return 'na';

    // Alpha versions keep the 'a' prefix in lowercase
    if (trimmed.match(/^[aA]\d+/)) {
        return trimmed.toLowerCase();
    }

    // V versions: remove V prefix, replace dots with underscores
    return trimmed
        .replace(/^[vV]/, '')  // Remove V prefix
        .replace(/\./g, '_');   // Replace dots with underscores
}

/**
 * Compare two game versions
 * Order: A20 < A21 < V1.0 < V1.1 < V1.1b14 < V1.2
 * N/A is treated as oldest (for sorting purposes)
 * Returns: < 0 if v1 < v2, 0 if v1 == v2, > 0 if v1 > v2
 */
export function compareGameVersions(v1: string, v2: string): number {
    const v1Upper = (v1 || '').toUpperCase();
    const v2Upper = (v2 || '').toUpperCase();

    // N/A handling - treat as oldest
    if (v1Upper === 'N/A' && v2Upper === 'N/A') return 0;
    if (v1Upper === 'N/A') return -1;
    if (v2Upper === 'N/A') return 1;

    const v1IsAlpha = v1Upper.startsWith('A');
    const v2IsAlpha = v2Upper.startsWith('A');

    // Alpha versions come before V versions
    if (v1IsAlpha && !v2IsAlpha) return -1;
    if (!v1IsAlpha && v2IsAlpha) return 1;

    // Extract version parts and build number
    const parseVersion = (v: string): { parts: number[], build: number } => {
        const clean = v.replace(/^[AVav]/, '');
        const buildMatch = clean.match(/b(\d+)$/);
        const build = buildMatch ? parseInt(buildMatch[1]) : 0;
        const versionStr = clean.replace(/b\d+$/, '');
        const parts = versionStr.split('.').map(n => parseInt(n) || 0);
        return { parts, build };
    };

    const { parts: v1Parts, build: v1Build } = parseVersion(v1Upper);
    const { parts: v2Parts, build: v2Build } = parseVersion(v2Upper);

    // Compare version numbers
    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
        const p1 = v1Parts[i] || 0;
        const p2 = v2Parts[i] || 0;
        if (p1 !== p2) return p1 - p2;
    }

    // If versions are equal, compare build numbers
    return v1Build - v2Build;
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
 * N/A versions get a constant zinc color and don't participate in gradient calculation.
 * 
 * @param version - The version to calculate color for (e.g., "V2.6", "A20", "N/A")
 * @param allVersions - List of all versions (including N/A if present)
 * @returns Hex color string
 */
export function calculateGameVersionColor(
    version: string,
    allVersions: string[]
): string {
    const OLDEST_COLOR = '#ef4444'; // red-500
    const NEWEST_COLOR = '#22c55e'; // green-500
    const NA_COLOR = '#71717a';     // zinc-500

    // N/A gets constant zinc color
    if (version.toUpperCase() === 'N/A') return NA_COLOR;

    // Filter out N/A from gradient calculation
    const validVersions = allVersions.filter(v => v.toUpperCase() !== 'N/A');

    if (validVersions.length === 0) return NEWEST_COLOR;
    if (validVersions.length === 1) return NEWEST_COLOR;

    // Sort versions oldest to newest
    const sorted = [...validVersions].sort((a, b) => compareGameVersions(a, b));

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

/**
 * Get fixed name for specific domains (Paypal, Boosty, X)
 */
export function getFixedLinkName(url: string): string | null {
    try {
        const normalizedUrl = url.trim();
        if (!normalizedUrl) return null;

        const hostname = new URL(normalizedUrl.startsWith('http') ? normalizedUrl : `https://${normalizedUrl}`).hostname.toLowerCase().replace('www.', '');

        if (hostname === 'paypal.com' || hostname === 'paypal.me') {
            return 'Paypal';
        }
        if (hostname === 'boosty.to') {
            return 'Boosty';
        }
        if (hostname === 'twitter.com' || hostname === 'x.com') {
            return 'X';
        }
    } catch {
        // invalid URL
    }
    return null;
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
