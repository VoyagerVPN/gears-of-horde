/**
 * Script to sync all tags to database
 * Run with: npx ts-node scripts/sync-tags.ts
 */

import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Author tag color (blue-500)
const AUTHOR_COLOR = '#3b82f6';

// Helper to interpolate color (red -> green gradient)
function interpolateColor(factor: number): string {
    const startColor = { r: 239, g: 68, b: 68 }; // red
    const endColor = { r: 34, g: 197, b: 94 };   // green

    const r = Math.round(startColor.r + (endColor.r - startColor.r) * factor);
    const g = Math.round(startColor.g + (endColor.g - startColor.g) * factor);
    const b = Math.round(startColor.b + (endColor.b - startColor.b) * factor);

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

async function main() {
    console.log('🏷️ Starting tag sync...\n');

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
    console.log(`📋 Found ${uniqueGameVersions.length} unique game versions:`, uniqueGameVersions);

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
            console.log(`  ✅ Created gamever tag: ${version}`);
        } else {
            console.log(`  ⏭️ gamever tag already exists: ${version}`);
        }
    }

    // 3. Link gamever tags to mods
    console.log('\n🔗 Linking gamever tags to mods...');
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
                console.log(`  ✅ Linked ${mod.slug} to gamever:${value}`);
            }
        }
    }

    // 4. Set blue color for all author tags
    console.log('\n🔵 Setting blue color for author tags...');
    const authorTagsUpdate = await prisma.tag.updateMany({
        where: {
            category: 'author'
        },
        data: {
            color: AUTHOR_COLOR
        }
    });
    results.authorTagsUpdated = authorTagsUpdate.count;
    console.log(`  ✅ Updated ${authorTagsUpdate.count} author tags with blue color`);

    // 5. Recalculate gamever colors (gradient)
    console.log('\n🌈 Recalculating gamever tag colors (red->green gradient)...');
    const gameVerTags = await prisma.tag.findMany({
        where: { category: 'gamever' }
    });

    if (gameVerTags.length > 0) {
        // Sort by version
        const sortedTags = gameVerTags.sort((a, b) => {
            const partsA = a.value.split('_').map(Number);
            const partsB = b.value.split('_').map(Number);
            for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
                const valA = partsA[i] || 0;
                const valB = partsB[i] || 0;
                if (valA !== valB) return valA - valB;
            }
            return 0;
        });

        for (let i = 0; i < sortedTags.length; i++) {
            const factor = sortedTags.length === 1 ? 1 : i / (sortedTags.length - 1);
            const color = interpolateColor(factor);

            await prisma.tag.update({
                where: { id: sortedTags[i].id },
                data: { color }
            });

            console.log(`  ✅ ${sortedTags[i].displayName}: ${color}`);
            results.gameVerColorsUpdated++;
        }
    }

    console.log('\n✨ Tag sync complete!');
    console.log('Results:', results);

    await prisma.$disconnect();
    await pool.end();
}

main().catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
});
