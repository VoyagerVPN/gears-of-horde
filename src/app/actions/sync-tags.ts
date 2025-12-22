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

import { db as prisma } from "@/lib/db";
import { recalculateGameVersionColors } from "@/lib/tags";
import { revalidatePath } from "next/cache";
import { ROUTES } from "@/lib/routes";
import { normalizeGameVersion, gameVersionToTagValue } from "@/lib/utils";
import { AUTHOR_TAG_COLOR } from "@/lib/tag-colors";

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
    const mods = await prisma.mod.findMany({
        select: {
            slug: true,
            gameVersion: true
        }
    });

    // Normalize all game versions and get unique normalized values
    const normalizedVersions = [...new Set(mods.map(m => m.gameVersion).filter(Boolean).map(normalizeGameVersion))];
    console.log(`Found ${normalizedVersions.length} unique game versions:`, normalizedVersions);

    // 1.5. Normalize mod.gameVersion values in database
    console.log('Normalizing mod gameVersion values...');
    for (const mod of mods) {
        if (!mod.gameVersion) continue;
        const normalized = normalizeGameVersion(mod.gameVersion);
        if (normalized !== mod.gameVersion) {
            await prisma.mod.update({
                where: { slug: mod.slug },
                data: { gameVersion: normalized }
            });
            results.gameVersionsNormalized++;
            console.log(`Normalized ${mod.slug}: "${mod.gameVersion}" → "${normalized}"`);
        }
    }

    // 2. Create gamever tags for each unique version
    for (const version of normalizedVersions) {
        // Convert "V2.4" to "2_4" for storage
        const value = gameVersionToTagValue(version);

        const existingTag = await prisma.tag.findUnique({
            where: {
                category_value: {
                    category: 'gamever',
                    value: value
                }
            }
        });

        if (!existingTag) {
            await prisma.tag.create({
                data: {
                    category: 'gamever',
                    value: value,
                    displayName: version // Keep "V2.4" format for display
                }
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

        const tag = await prisma.tag.findUnique({
            where: {
                category_value: {
                    category: 'gamever',
                    value: value
                }
            }
        });

        if (tag) {
            // Check if link already exists
            const existingLink = await prisma.modTag.findUnique({
                where: {
                    modId_tagId: {
                        modId: mod.slug,
                        tagId: tag.id
                    }
                }
            });

            if (!existingLink) {
                await prisma.modTag.create({
                    data: {
                        modId: mod.slug,
                        tagId: tag.id
                    }
                });
                results.gameVerLinksCreated++;
                console.log(`Linked ${mod.slug} to gamever:${value}`);
            }
        }
    }

    // 4. Set blue color for all author tags
    const authorTagsUpdate = await prisma.tag.updateMany({
        where: {
            category: 'author'
        },
        data: {
            color: AUTHOR_TAG_COLOR
        }
    });
    results.authorTagsUpdated = authorTagsUpdate.count;
    console.log(`Updated ${authorTagsUpdate.count} author tags with color ${AUTHOR_TAG_COLOR}`);

    // 5. Recalculate gamever colors (gradient)
    const colorResults = await recalculateGameVersionColors(prisma);
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
    const mods = await prisma.mod.findMany({
        select: { slug: true, gameVersion: true }
    });

    for (const mod of mods) {
        if (!mod.gameVersion) continue;
        const normalized = normalizeGameVersion(mod.gameVersion);
        if (normalized !== mod.gameVersion) {
            await prisma.mod.update({
                where: { slug: mod.slug },
                data: { gameVersion: normalized }
            });
            results.modsNormalized++;
            console.log(`Mod: "${mod.gameVersion}" → "${normalized}"`);
        }
    }

    // 2. Normalize gamever tag displayNames
    const gameVerTags = await prisma.tag.findMany({
        where: { category: 'gamever' }
    });

    for (const tag of gameVerTags) {
        const normalized = normalizeGameVersion(tag.displayName);
        if (normalized !== tag.displayName) {
            await prisma.tag.update({
                where: { id: tag.id },
                data: { displayName: normalized }
            });
            results.tagsNormalized++;
            console.log(`Tag: "${tag.displayName}" → "${normalized}"`);
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
    const result = await prisma.tag.updateMany({
        where: {
            category: 'author'
        },
        data: {
            color: AUTHOR_TAG_COLOR
        }
    });

    revalidatePath(ROUTES.mods);
    revalidatePath(ROUTES.tags);

    return { updated: result.count };
}
