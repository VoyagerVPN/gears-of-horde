'use server';

/**
 * Sync all tags to database with proper colors and links
 * 
 * This script:
 * 1. Creates gamever tags for all unique gameVersion values
 * 2. Links gamever tags to mods based on gameVersion field
 * 3. Sets cyan color (#22d3ee) for all author tags
 * 4. Recalculates gamever colors using gradient (red->green)
 */


import { recalculateGameVersionColors } from "@/lib/tags";
import { revalidatePath } from "next/cache";
import { ROUTES } from "@/lib/routes";
import { normalizeGameVersion, gameVersionToTagValue } from "@/lib/utils";
import { AUTHOR_TAG_COLOR } from "@/lib/tag-colors";
import { db } from "@/lib/db";

export async function syncAllTags() {
    console.log('Starting tag sync...');

    const results = {
        gameVerTagsCreated: 0,
        gameVerLinksCreated: 0,
        authorTagsUpdated: 0,
        gameVerColorsUpdated: 0,
        gameVersionsNormalized: 0
    };

    // 1. Get all unique gameVersions from mods
    const { data: mods } = await db
        .from('Mod')
        .select('slug, gameVersion');

    if (!mods) return results;

    // Normalize all game versions and get unique normalized values
    const normalizedVersions = [...new Set((mods || []).map((m) => m.gameVersion).filter(Boolean).map((v) => normalizeGameVersion(v!)))] as string[];
    console.log(`Found ${normalizedVersions.length} unique game versions:`, normalizedVersions);

    // 1.5. Normalize mod.gameVersion values in database
    console.log('Normalizing mod gameVersion values...');
    for (const mod of mods) {
        if (!mod.gameVersion) continue;
        const normalized = normalizeGameVersion(mod.gameVersion);
        if (normalized !== mod.gameVersion) {
            await db
                .from('Mod')
                .update({ gameVersion: normalized })
                .eq('slug', mod.slug);
            
            results.gameVersionsNormalized++;
            console.log(`Normalized ${mod.slug}: "${mod.gameVersion}" → "${normalized}"`);
        }
    }

    // 2. Create gamever tags for each unique version
    for (const version of normalizedVersions) {
        // Convert "V2.4" to "2_4" for storage
        const value = gameVersionToTagValue(version);

        const { data: existingTag } = await db
            .from('Tag')
            .select('id')
            .eq('category', 'gamever')
            .eq('value', value)
            .maybeSingle();

        if (!existingTag) {
            await db.from('Tag').insert({
                category: 'gamever',
                value: value,
                displayName: version // Keep "V2.4" format for display
            });
            results.gameVerTagsCreated++;
            console.log(`Created gamever tag: ${version}`);
        }
    }

    // 3. Link gamever tags to mods
    for (const mod of mods) {
        if (!mod.gameVersion) continue;

        // Use normalized version for consistent tag lookup
        const normalizedVersion = normalizeGameVersion(mod.gameVersion);
        const value = gameVersionToTagValue(normalizedVersion);

        const { data: tag } = await db
            .from('Tag')
            .select('id')
            .eq('category', 'gamever')
            .eq('value', value)
            .maybeSingle();

        if (tag) {
            // Check if link already exists
            const { data: existingLink } = await db
                .from('ModTag')
                .select('modId')
                .eq('modId', mod.slug)
                .eq('tagId', tag.id)
                .maybeSingle();

            if (!existingLink) {
                await db.from('ModTag').insert({
                    modId: mod.slug,
                    tagId: tag.id
                });
                results.gameVerLinksCreated++;
                console.log(`Linked ${mod.slug} to gamever:${value}`);
            }
        }
    }

    // 4. Set blue color for all author tags
    const { data: authorTags, error: authorError } = await db
        .from('Tag')
        .update({ color: AUTHOR_TAG_COLOR })
        .eq('category', 'author')
        .select('id');
    
    if (authorError) {
        console.error('Failed to update author tags:', authorError);
    } else {
        results.authorTagsUpdated = authorTags?.length || 0;
        console.log(`Updated ${results.authorTagsUpdated} author tags with color ${AUTHOR_TAG_COLOR}`);
    }

    // 5. Recalculate gamever colors (gradient)
    const colorResults = await recalculateGameVersionColors();
    results.gameVerColorsUpdated = colorResults.length;
    console.log(`Updated colors for ${colorResults.length} gamever tags:`, colorResults);

    // 6. Revalidate pages
    revalidatePath(ROUTES.mods);
    revalidatePath(ROUTES.tags);
    revalidatePath('/');

    console.log('Tag sync complete!', results);
    return results;
}

/**
 * Normalize all existing game version data in the database
 * - Updates mod.gameVersion to always have "V" prefix
 * - Updates gamever tag displayNames to always have "V" prefix
 */
export async function normalizeAllGameVersions() {
    console.log('Starting game version normalization...');

    const results = {
        modsNormalized: 0,
        tagsNormalized: 0
    };

    // 1. Normalize mod.gameVersion fields
    const { data: mods } = await db
        .from('Mod')
        .select('slug, gameVersion');

    if (mods) {
        for (const mod of mods) {
            if (!mod.gameVersion) continue;
            const normalized = normalizeGameVersion(mod.gameVersion);
            if (normalized !== mod.gameVersion) {
                await db
                    .from('Mod')
                    .update({ gameVersion: normalized })
                    .eq('slug', mod.slug);
                
                results.modsNormalized++;
                console.log(`Mod: "${mod.gameVersion}" → "${normalized}"`);
            }
        }
    }

    // 2. Normalize gamever tag displayNames
    const { data: gameVerTags } = await db
        .from('Tag')
        .select('id, displayName')
        .eq('category', 'gamever');

    if (gameVerTags) {
        for (const tag of gameVerTags) {
            const normalized = normalizeGameVersion(tag.displayName);
            if (normalized !== tag.displayName) {
                await db
                    .from('Tag')
                    .update({ displayName: normalized })
                    .eq('id', tag.id);
                
                results.tagsNormalized++;
                console.log(`Tag: "${tag.displayName}" → "${normalized}"`);
            }
        }
    }

    // Revalidate pages
    revalidatePath(ROUTES.mods);
    revalidatePath(ROUTES.tags);
    revalidatePath('/');

    console.log('Game version normalization complete!', results);
    return results;
}

export async function setAuthorTagsBlue() {
    const { data: updatedTags, error } = await db
        .from('Tag')
        .update({ color: AUTHOR_TAG_COLOR })
        .eq('category', 'author')
        .select('id');

    if (error) {
        console.error('Failed to set author tags blue:', error);
        return { updated: 0 };
    }

    revalidatePath(ROUTES.mods);
    revalidatePath(ROUTES.tags);

    return { updated: updatedTags?.length || 0 };
}
