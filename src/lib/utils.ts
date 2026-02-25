import { type TagData } from "@/types/mod";

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
/**
 * Represents a parsed game version for 7 Days to Die
 */
export interface GameVersion {
    prefix: 'A' | 'V';
    v1: number;
    v2: number;
    build?: number;
}

/**
 * Parses a string into a GameVersion object.
 * Handles: "V1.1 b14", "A21", "1.0", "v1.1-b14", etc.
 */
export function parseGameVersion(version: string): GameVersion | null {
    if (!version) return null;
    const clean = version.trim();
    if (clean.toUpperCase() === 'N/A') return null;

    // Match prefix (optional, defaults to V), digits, separator (dot, space, underscore, dash), digits, 
    // and optional build (b, build, dash followed by digits)
    const regex = /^([av])?\s*(\d+)(?:[.\s_-](\d+))?(?:\s*[b-]|build\s*)?(\d+)?$/i;
    const match = clean.match(regex);

    if (!match) return null;

    const prefix = (match[1]?.toUpperCase() as 'A' | 'V') || 'V';
    const v1 = parseInt(match[2]) || 0;
    const v2 = parseInt(match[3]) || 0;
    const build = match[4] ? parseInt(match[4]) : undefined;

    return { prefix, v1, v2, build };
}

/**
 * Calculates a numerical weight for a version to ensure correct database sorting.
 * Stable (V) > Alpha (A)
 */
export function calculateGameVersionWeight(v: GameVersion | null): number {
    if (!v) return 0;
    
    // Weights:
    // Prefix: V = 2,000,000; A = 1,000,000
    // V1: * 10,000
    // V2: * 100
    // Build: * 1
    const prefixWeight = v.prefix === 'V' ? 2000000 : 1000000;
    return prefixWeight + (v.v1 * 10000) + (v.v2 * 100) + (v.build || 0);
}

/**
 * Formats a GameVersion into a standardized string.
 */
export function formatGameVersion(v: GameVersion | null, type: 'display' | 'value' = 'display'): string {
    if (!v) return 'N/A';

    if (type === 'value') {
        const buildStr = v.build !== undefined ? `-b${v.build}` : '';
        return `${v.prefix.toLowerCase()}${v.v1}.${v.v2}${buildStr}`;
    }

    const buildStr = v.build !== undefined ? ` b${v.build}` : '';
    return `${v.prefix}${v.v1}.${v.v2}${buildStr}`;
}

/**
 * @deprecated Use parseGameVersion and formatGameVersion instead.
 * Keeps compatibility for existing components during transition.
 */
export function normalizeGameVersion(version: string): string {
    const parsed = parseGameVersion(version);
    return formatGameVersion(parsed, 'display');
}

/**
 * @deprecated Use parseGameVersion and formatGameVersion instead.
 */
export function gameVersionToTagValue(version: string): string {
    const parsed = parseGameVersion(version);
    return formatGameVersion(parsed, 'value');
}

/**
 * Compares two game version strings using their calculated weights.
 */
export function compareGameVersions(v1: string, v2: string): number {
    const w1 = calculateGameVersionWeight(parseGameVersion(v1));
    const w2 = calculateGameVersionWeight(parseGameVersion(v2));
    return w1 - w2;
}

/**
 * Get the latest game version from a list of tags
 */
export function getLatestGameVersion(tags: { displayName: string }[], defaultVersion = 'V1.4'): string {
    if (!tags || tags.length === 0) return defaultVersion;

    const sorted = [...tags].sort((a, b) => compareGameVersions(b.displayName, a.displayName));
    return sorted[0]?.displayName || defaultVersion;
}

export function getGameVerColor(version: string | TagData): string {
    const value = typeof version === 'string' ? version : (version.value || version.displayName);
    const parsed = parseGameVersion(value);
    
    if (!parsed) return 'zinc';

    // Highlight Alpha as amber/orange, Stable as emerald/green
    if (parsed.prefix === 'A') {
        if (parsed.v1 >= 21) return 'amber';
        return 'orange';
    }
    
    if (parsed.v1 >= 1) return 'emerald';
    return 'blue';
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
