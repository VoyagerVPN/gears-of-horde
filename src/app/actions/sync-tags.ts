'use server';

/**
 * Sync all tags to database with proper colors and links
 * 
 * This script:
 * 1. Creates gamever tags for all unique gameVersion values
 * 2. Links gamever tags to mods based on gameVersion field
 * 3. Sets blue color (#3b82f6) for all author tags
 * 4. Recalculates gamever colors using gradient (red->green)
 */

import { db as prisma } from "@/lib/db";
import { recalculateGameVersionColors } from "@/lib/tags";
import { revalidatePath } from "next/cache";
import { ROUTES } from "@/lib/routes";

// Author tag color (blue-500)
const AUTHOR_COLOR = '#3b82f6';

export async function syncAllTags() {
    console.log('Starting tag sync...');

    const results = {
        gameVerTagsCreated: 0,
        gameVerLinksCreated: 0,
        authorTagsUpdated: 0,
        gameVerColorsUpdated: 0
    };

    // 1. Get all unique gameVersions from mods
    const mods = await prisma.mod.findMany({
        select: {
            slug: true,
            gameVersion: true
        }
    });

    const uniqueGameVersions = [...new Set(mods.map(m => m.gameVersion).filter(Boolean))];
    console.log(`Found ${uniqueGameVersions.length} unique game versions:`, uniqueGameVersions);

    // 2. Create gamever tags for each unique version
    for (const version of uniqueGameVersions) {
        // Convert "V2.4" to "2_4" for storage
        const value = version.replace(/^V/, '').replace('.', '_');

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

        const value = mod.gameVersion.replace(/^V/, '').replace('.', '_');

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
            color: AUTHOR_COLOR
        }
    });
    results.authorTagsUpdated = authorTagsUpdate.count;
    console.log(`Updated ${authorTagsUpdate.count} author tags with blue color`);

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

export async function setAuthorTagsBlue() {
    const result = await prisma.tag.updateMany({
        where: {
            category: 'author'
        },
        data: {
            color: AUTHOR_COLOR
        }
    });

    revalidatePath(ROUTES.mods);
    revalidatePath(ROUTES.tags);

    return { updated: result.count };
}
