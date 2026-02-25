/**
 * Tag Utility Functions
 * 
 * Shared functions for tag creation and lookup to eliminate
 * duplicate code across action files.
 */

import { db } from './db';
import { AUTHOR_TAG_COLOR, FALLBACK_TAG_COLOR } from './tag-colors';

// Re-export color constants for convenience
// const MOD_STABLE_COLOR = '#3b82f6'; // blue-500

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
 * @param weight - Optional sorting weight (for game versions)
 * @returns The found or created tag
 */
async function findOrCreateTag(
    category: string,
    value: string,
    displayName: string,
    color?: string,
    weight?: number
): Promise<{ id: string; category: string; value: string; displayName: string; color: string | null; weight: number | null }> {
    // Try to find existing tag
    const { data: tag, error: findError } = await db
        .from('Tag')
        .select('*')
        .eq('category', category)
        .eq('value', value)
        .single();

    if (tag) {
        // Update weight if it's missing but provided now
        if (weight !== undefined && tag.weight === null) {
            await db.from('Tag').update({ weight }).eq('id', tag.id);
            tag.weight = weight;
        }
        return tag;
    }

    // Handle potential error or non-existence
    if (findError && findError.code !== 'PGRST116') { // PGRST116 is code for "no rows found"
        throw new Error(`Failed to lookup tag: ${findError.message}`);
    }

    // Create if not found
    const { data: newTag, error: createError } = await db
        .from('Tag')
        .insert({
            category,
            value,
            displayName,
            color: color ?? FALLBACK_TAG_COLOR,
            weight: weight ?? null
        })
        .select()
        .single();

    if (createError || !newTag) {
        throw new Error(`Failed to create tag: ${createError?.message}`);
    }

    return newTag;
}

/**
 * Find or create an author tag
 * 
 * @param authorName - Author display name
 * @returns The found or created author tag
 */
export async function findOrCreateAuthorTag(
    authorName: string
): Promise<{ id: string; category: string; value: string; displayName: string; color: string | null; weight: number | null }> {
    const value = authorName.toLowerCase().replace(/\s+/g, '_');
    return findOrCreateTag('author', value, authorName, AUTHOR_TAG_COLOR);
}

/**
 * Find or create a game version tag
 * 
 * @param version - Raw or normalized version string
 * @returns The found or created gamever tag
 */
export async function findOrCreateGameVerTag(
    version: string
): Promise<{ id: string; category: string; value: string; displayName: string; color: string | null; weight: number | null }> {
    const { parseGameVersion, formatGameVersion, calculateGameVersionWeight } = await import('./utils');
    
    const parsed = parseGameVersion(version);
    const display = formatGameVersion(parsed, 'display');
    const storageValue = formatGameVersion(parsed, 'value');
    const weight = calculateGameVersionWeight(parsed);

    // Gamever tags don't get a color initially
    return findOrCreateTag('gamever', storageValue, display, undefined, weight);
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

/**
 * Find or create a language tag
 * 
 * @param langName - Language display name (e.g., "English", "Russian")
 * @returns The found or created lang tag
 */
export async function findOrCreateLangTag(
    langName: string
): Promise<{ id: string; category: string; value: string; displayName: string; color: string | null }> {
    const value = langName.toLowerCase().trim().replace(/\s+/g, '_');
    return findOrCreateTag('lang', value, langName);
}

/**
 * Find or create a status tag
 * 
 * @param status - Status value (e.g., 'active', 'on_hold')
 * @returns The found or created status tag
 */
export async function findOrCreateStatusTag(
    status: string
): Promise<{ id: string; category: string; value: string; displayName: string; color: string | null }> {
    const value = status.toLowerCase();
    const displayName = status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
    return findOrCreateTag('status', value, displayName);
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
    const { data: tag, error: findError } = await db
        .from('Tag')
        .select('*')
        .eq('category', 'tag')
        .ilike('displayName', tagName)
        .limit(1)
        .maybeSingle();

    if (tag) {
        return tag;
    }

    if (findError) {
        throw new Error(`Failed to lookup generic tag: ${findError.message}`);
    }

    // Create if not found
    const { data: newTag, error: createError } = await db
        .from('Tag')
        .insert({
            category: 'tag',
            value,
            displayName: tagName,
            color: FALLBACK_TAG_COLOR
        })
        .select()
        .single();

    if (createError || !newTag) {
        throw new Error(`Failed to create generic tag: ${createError?.message}`);
    }

    return newTag;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

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
    const { data: exists, error: findError } = await db
        .from('ModTag')
        .select('*')
        .eq('modId', modSlug)
        .eq('tagId', tagId)
        .maybeSingle();

    if (findError) throw new Error(`Query error: ${findError.message}`);

    if (exists) {
        if (metadata) {
            const { error: updateError } = await db
                .from('ModTag')
                .update({
                    isExternal: metadata.isExternal ?? exists.isExternal,
                    externalLink: metadata.externalLink ?? exists.externalLink
                })
                .eq('modId', modSlug)
                .eq('tagId', tagId);
            
            if (updateError) throw new Error(`Update error: ${updateError.message}`);
        }
    } else {
        const { error: createError } = await db
            .from('ModTag')
            .insert({
                modId: modSlug,
                tagId,
                isExternal: metadata?.isExternal ?? false,
                externalLink: metadata?.externalLink || null
            });
        
        if (createError) throw new Error(`Create error: ${createError.message}`);
    }
}

/**
 * Batch link multiple tags to a mod
 * 
 * @param modSlug - Mod slug
 * @param tagIds - Array of tag IDs
 */
export async function batchLinkTagsToMod(modSlug: string, tagIds: string[]): Promise<void> {
    if (tagIds.length === 0) return;

    // Get existing links
    const { data: existingLinks, error: findError } = await db
        .from('ModTag')
        .select('tagId')
        .eq('modId', modSlug)
        .in('tagId', tagIds);

    if (findError) throw new Error(`Fetch error: ${findError.message}`);

    const existingTagIds = new Set(existingLinks?.map(l => l.tagId) || []);
    const newTagIds = tagIds.filter(id => !existingTagIds.has(id));

    if (newTagIds.length > 0) {
        const { error: createError } = await db
            .from('ModTag')
            .insert(newTagIds.map(tagId => ({ modId: modSlug, tagId })));
        
        if (createError) throw new Error(`Batch insert error: ${createError.message}`);
    }
}

/**
 * Remove all tags of a specific category from a mod
 * 
 * @param modSlug - Mod slug
 * @param category - Tag category to remove
 */
export async function removeModTagsByCategory(modSlug: string, category: string): Promise<void> {
    // We need to join or subquery to filter by category in Supabase delete
    // OR we can fetch IDs first. Fetching IDs is safer for complex joins.
    const { data: tagsToRemove, error: fetchError } = await db
        .from('ModTag')
        .select('tagId, Tag!inner(category)')
        .eq('modId', modSlug)
        .eq('Tag.category', category);

    if (fetchError) throw new Error(`Fetch error: ${fetchError.message}`);

    if (tagsToRemove && tagsToRemove.length > 0) {
        const tagIds = tagsToRemove.map(t => t.tagId);
        const { error: deleteError } = await db
            .from('ModTag')
            .delete()
            .eq('modId', modSlug)
            .in('tagId', tagIds);
        
        if (deleteError) throw new Error(`Delete error: ${deleteError.message}`);
    }
}

