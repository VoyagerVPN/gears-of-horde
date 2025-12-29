/**
 * Tag Color Configuration
 * 
 * This file provides default colors for tag categories.
 * These are used as FALLBACKS when:
 * 1. Creating a new tag without specifying a color
 * 2. A tag doesn't have a color in the database
 * 
 * Priority: DB color > Category:Value config > Category config > Fallback
 */

// ============================================================================
// COLOR CONSTANTS (use these instead of hardcoding hex values)
// ============================================================================

/** Default color for tags without a specific category color */
export const FALLBACK_TAG_COLOR = '#a1a1a1'; // gray

/** Color for author tags */
export const AUTHOR_TAG_COLOR = '#22d3ee'; // cyan-400

/** Color for primary/accent elements */
export const PRIMARY_COLOR = '#ce4729';

/** Color for built-in language tags (same as primary) */
export const LANG_BUILTIN_COLOR = PRIMARY_COLOR;

/** Game version gradient colors */
export const GAME_VERSION_COLORS = {
    oldest: '#ef4444', // red-500 (RGB: 239, 68, 68)
    newest: '#22c55e', // green-500 (RGB: 34, 197, 94)
    na: '#71717a',     // zinc-500 (for N/A unreleased mods)
} as const;

/**
 * Category-specific default colors
 * 
 * Supports both:
 * - category-only: 'author' -> cyan
 * - category:value: 'status:active' -> green
 */
export const TAG_CATEGORY_COLORS: Record<string, string> = {
    // === AUTHOR ===
    'author': AUTHOR_TAG_COLOR,

    // === GENERIC TAGS ===
    'tag': '#a1a1aa', // zinc-400 (neutral)

    // === GAME VERSIONS ===
    // Default to newest green as fallback
    // (actual colors are calculated dynamically via recalculateGameVersionColors)
    // N/A versions get constant zinc color
    'gamever': GAME_VERSION_COLORS.newest,
    'gamever:na': GAME_VERSION_COLORS.na,

    // === STATUS ===
    'status:active': '#22c55e',      // green-500
    'status:on_hold': '#eab308',     // yellow-500
    'status:discontinued': '#ef4444', // red-500
    'status:upcoming': '#22d3ee',     // cyan-400
    'status:unknown': '#d4d4d8',      // zinc-300 (brighter for better distinction when active)

    // === NEWS CATEGORIES ===
    'newscat:new': '#a855f7',     // purple-500
    'newscat:update': '#22c55e',  // green-500
    'newscat:release': '#22d3ee', // cyan-400
    'newscat:status': '#a1a1a1',  // gray

    // === LANGUAGE (special handling) ===
    // - builtin: uses zinc color with primary text
    // - external: uses full primary color (clickable with download)
    'lang': '#71717a',                      // zinc-500 for default/builtin
    'lang:builtin': '#71717a',              // zinc-500
    'lang:external': PRIMARY_COLOR,         // Full primary for external

    // === GAME VERSIONS ===
    // Colors are calculated dynamically via recalculateGameVersionColors()
    // No static colors defined here - they come from DB
};

/**
 * Get color for a tag based on category and optional value
 * 
 * @param category - Tag category (e.g., 'author', 'status', 'gamever')
 * @param value - Optional tag value (e.g., 'active', 'on_hold')
 * @param dbColor - Color from database (takes highest priority if provided)
 * @returns Hex color string
 * 
 * @example
 * getTagColor('author', 'khaine')       // '#22d3ee' (cyan)
 * getTagColor('status', 'active')       // '#22c55e' (green)
 * getTagColor('gamever', '1_0', '#ef4444') // '#ef4444' (from DB)
 */
export function getTagColor(
    category: string,
    value?: string,
    dbColor?: string | null
): string {
    // 1. DB color takes highest priority
    if (dbColor) return dbColor;

    // Normalize to lowercase for consistent lookup
    const normalizedCategory = category.toLowerCase();
    const normalizedValue = value?.toLowerCase();

    // 2. Try category:value combo (e.g., 'status:active', 'newscat:update')
    if (normalizedValue) {
        const comboKey = `${normalizedCategory}:${normalizedValue}`;
        if (TAG_CATEGORY_COLORS[comboKey]) {
            return TAG_CATEGORY_COLORS[comboKey];
        }
    }

    // 3. Try category alone (e.g., 'author')
    if (TAG_CATEGORY_COLORS[normalizedCategory]) {
        return TAG_CATEGORY_COLORS[normalizedCategory];
    }

    // 4. Fallback to default gray
    return FALLBACK_TAG_COLOR;
}

/**
 * Convert hex color to inline style object for dynamic tag coloring
 * 
 * @param hex - Hex color string (e.g., '#22c55e')
 * @returns Style object with backgroundColor, color, and borderColor
 * 
 * @example
 * colorToTagStyles('#22c55e')
 * // { color: '#22c55e', backgroundColor: '#22c55e1a', borderColor: '#22c55e33' }
 */
export function colorToTagStyles(hex: string): React.CSSProperties {
    return {
        color: hex,
        backgroundColor: `${hex}1a`, // ~10% opacity
    };
}

/**
 * Tag styling constants
 * These match the CSS variables in globals.css for consistency
 */
export const TAG_STYLES = {
    borderRadius: '6px',      // --tag-radius
    fontSize: '12px',         // --tag-font-size
    paddingX: '0.75rem',      // --tag-padding-x
    paddingY: '0.25rem',      // --tag-padding-y
    fontWeight: 600,          // --tag-font-weight
} as const;
