/**
 * Tag Utility Functions
 * 
 * Shared functions for tag creation and lookup to eliminate
 * duplicate code across action files.
 */

import { db as prisma } from './db';
import { TAG_CATEGORY_COLORS, AUTHOR_TAG_COLOR, FALLBACK_TAG_COLOR } from './tag-colors';

// Re-export color constants for convenience
export { AUTHOR_TAG_COLOR, FALLBACK_TAG_COLOR as DEFAULT_TAG_COLOR } from './tag-colors';

// ============================================================================
// TAG CREATION UTILITIES
// ============================================================================

/**
 * Find or create a tag by category and value
 * 
 * @param category - Tag category (e.g., 'tag', 'author', 'gamever')
 * @param value - Tag value (normalized, e.g., 'survival_mode')
 * @param displayName - Display name (e.g., 'Survival Mode')
 * @param color - Optional color override
 * @returns The found or created tag
 */
export async function findOrCreateTag(
    category: string,
    value: string,
    displayName: string,
    color?: string
): Promise<{ id: string; category: string; value: string; displayName: string; color: string | null }> {
    // Try to find existing tag
    let tag = await prisma.tag.findUnique({
        where: {
            category_value: {
                category,
                value
            }
        }
    });

    if (!tag) {
        // Determine default color based on category
        const defaultColor = color ?? getDefaultColorForCategory(category, value);

        tag = await prisma.tag.create({
            data: {
                category,
                value,
                displayName,
                color: defaultColor
            }
        });
    }

    return tag;
}

/**
 * Find or create an author tag
 * 
 * @param authorName - Author display name
 * @returns The found or created author tag
 */
export async function findOrCreateAuthorTag(
    authorName: string
): Promise<{ id: string; category: string; value: string; displayName: string; color: string | null }> {
    const value = authorName.toLowerCase().replace(/\s+/g, '_');
    return findOrCreateTag('author', value, authorName, AUTHOR_TAG_COLOR);
}

/**
 * Find or create a game version tag
 * 
 * @param version - Normalized version string (e.g., 'V2.2')
 * @returns The found or created gamever tag
 */
export async function findOrCreateGameVerTag(
    version: string
): Promise<{ id: string; category: string; value: string; displayName: string; color: string | null }> {
    // Convert "V2.4" to "2_4" for storage
    const value = version.replace(/^[vV]/, '').replace(/\./g, '_');

    // Gamever tags don't get a color initially - it's calculated by recalculateGameVersionColors
    return findOrCreateTag('gamever', value, version, undefined);
}

/**
 * Find or create a newscat tag
 * 
 * @param eventType - Event type (e.g., 'update', 'release', 'new')
 * @returns The found or created newscat tag
 */
export async function findOrCreateNewscatTag(
    eventType: string
): Promise<{ id: string; category: string; value: string; displayName: string; color: string | null }> {
    const value = eventType.toLowerCase();
    const displayName = eventType.charAt(0).toUpperCase() + eventType.slice(1).toLowerCase();
    return findOrCreateTag('newscat', value, displayName);
}

export async function findOrCreateLangTag(
    langName: string,
    langCode: string
): Promise<{ id: string; category: string; value: string; displayName: string; color: string | null }> {
    const value = langCode.toLowerCase();
    return findOrCreateTag('lang', value, langName);
}

/**
 * Find or create a generic tag
 * 
 * @param tagName - Tag display name
 * @returns The found or created tag
 */
export async function findOrCreateGenericTag(
    tagName: string
): Promise<{ id: string; category: string; value: string; displayName: string; color: string | null }> {
    const value = tagName.toLowerCase().replace(/\s+/g, '-');

    // First try to find by displayName (case-insensitive)
    let tag = await prisma.tag.findFirst({
        where: {
            category: 'tag',
            displayName: { equals: tagName, mode: 'insensitive' }
        }
    });

    if (!tag) {
        tag = await prisma.tag.create({
            data: {
                category: 'tag',
                value,
                displayName: tagName,
                color: FALLBACK_TAG_COLOR
            }
        });
    }

    return tag;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get default color for a tag category
 */
function getDefaultColorForCategory(category: string, value?: string): string | undefined {
    // Try category:value combo first
    if (value) {
        const comboKey = `${category.toLowerCase()}:${value.toLowerCase()}`;
        if (TAG_CATEGORY_COLORS[comboKey]) {
            return TAG_CATEGORY_COLORS[comboKey];
        }
    }

    // Try category alone
    const categoryKey = category.toLowerCase();
    if (TAG_CATEGORY_COLORS[categoryKey]) {
        return TAG_CATEGORY_COLORS[categoryKey];
    }

    return FALLBACK_TAG_COLOR;
}

export async function linkTagToMod(modSlug: string, tagId: string): Promise<void> {
    await linkTagToModWithMetadata(modSlug, tagId);
}

/**
 * Link a tag to a mod with additional metadata
 * 
 * @param modSlug - Mod slug
 * @param tagId - Tag ID
 * @param metadata - Optional metadata (isExternal, externalLink)
 */
export async function linkTagToModWithMetadata(
    modSlug: string,
    tagId: string,
    metadata?: { isExternal?: boolean; externalLink?: string }
): Promise<void> {
    const exists = await prisma.modTag.findUnique({
        where: { modId_tagId: { modId: modSlug, tagId } }
    });

    if (exists) {
        // Update if metadata provided
        if (metadata) {
            await prisma.modTag.update({
                where: { modId_tagId: { modId: modSlug, tagId } },
                data: {
                    isExternal: metadata.isExternal ?? exists.isExternal,
                    externalLink: metadata.externalLink ?? exists.externalLink
                }
            });
        }
    } else {
        await prisma.modTag.create({
            data: {
                modId: modSlug,
                tagId,
                isExternal: metadata?.isExternal ?? false,
                externalLink: metadata?.externalLink || null
            }
        });
    }
}

/**
 * Batch link multiple tags to a mod
 * 
 * @param modSlug - Mod slug
 * @param tagIds - Array of tag IDs
 */
export async function batchLinkTagsToMod(modSlug: string, tagIds: string[]): Promise<void> {
    // Get existing links
    const existingLinks = await prisma.modTag.findMany({
        where: {
            modId: modSlug,
            tagId: { in: tagIds }
        },
        select: { tagId: true }
    });

    const existingTagIds = new Set(existingLinks.map(l => l.tagId));
    const newTagIds = tagIds.filter(id => !existingTagIds.has(id));

    if (newTagIds.length > 0) {
        await prisma.modTag.createMany({
            data: newTagIds.map(tagId => ({ modId: modSlug, tagId })),
            skipDuplicates: true
        });
    }
}

/**
 * Remove all tags of a specific category from a mod
 * 
 * @param modSlug - Mod slug
 * @param category - Tag category to remove
 */
export async function removeModTagsByCategory(modSlug: string, category: string): Promise<void> {
    await prisma.modTag.deleteMany({
        where: {
            modId: modSlug,
            tag: { category }
        }
    });
}
