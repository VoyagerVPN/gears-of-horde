// Run this script once to fix the N/A tag color
// Usage: npx tsx scripts/fix_na_color.ts

import fs from 'fs';
import path from 'path';

// 1. Load env vars BEFORE importing db
const loadEnv = () => {
    try {
        const envPath = path.resolve(process.cwd(), '.env');
        if (fs.existsSync(envPath)) {
            const envConfig = fs.readFileSync(envPath, 'utf-8');
            envConfig.split('\n').forEach(line => {
                const [key, ...valueParts] = line.split('=');
                if (key && valueParts.length > 0) {
                    const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
                    if (!process.env[key.trim()]) {
                        process.env[key.trim()] = value;
                    }
                }
            });
            console.log("✅ Loaded environment variables from .env");
        }
    } catch (e) {
        console.warn("⚠️ Could not load .env file:", e);
    }
};

loadEnv();

// 2. Dynamic imports after env is loaded
const main = async () => {
    const { db: prisma } = await import("../src/lib/db");
    const { GAME_VERSION_COLORS } = await import("../src/lib/tag-colors");

    console.log("Finding N/A tag...");

    // Check all tags to debug duplicates
    const allNaTags = await prisma.tag.findMany({
        where: {
            OR: [
                { value: 'na' },
                { displayName: 'N/A' },
                { value: 'N/A' } // check for un-normalized value
            ],
            category: 'gamever'
        }
    });

    console.log(`Found ${allNaTags.length} potential N/A tags`);
    allNaTags.forEach(t => console.log(`- ID: ${t.id}, Value: "${t.value}", Display: "${t.displayName}", Color: ${t.color}`));

    // Fix color for the correct one
    const validNaTag = allNaTags.find(t => t.value.toLowerCase() === 'na');

    if (!validNaTag) {
        if (allNaTags.length === 0) {
            console.log("❌ N/A tag not found. Please create it first in Admin UI.");
        } else {
            console.log("❌ No tag found with value='na'. Found others though.");
        }
        return;
    }

    if (validNaTag.color === GAME_VERSION_COLORS.na) {
        console.log("✅ N/A tag already has correct zinc color!");
    } else {
        console.log(`Updating color to zinc: ${GAME_VERSION_COLORS.na}`);
        await prisma.tag.update({
            where: { id: validNaTag.id },
            data: { color: GAME_VERSION_COLORS.na }
        });
        console.log("✅ N/A tag color updated successfully!");
    }

    // Check for duplicates and delete incorrect ones
    if (allNaTags.length > 1) {
        console.warn("⚠️ WARNING: Multiple N/A tags found!");

        const tagsToDelete = allNaTags.filter(t => t.value !== 'na');

        for (const tag of tagsToDelete) {
            console.log(`Deleting duplicate invalid tag: ID=${tag.id}, Value="${tag.value}", Color=${tag.color}`);

            // Check usage first in ModTag (join table)
            const usageCount = await prisma.modTag.count({
                where: { tagId: tag.id }
            });

            if (usageCount > 0) {
                console.log(`Tag is used by ${usageCount} mods. Migrating usage to valid tag...`);
                // Find all ModTags with bad tag
                const modTags = await prisma.modTag.findMany({
                    where: { tagId: tag.id }
                });

                for (const modTag of modTags) {
                    // Check if valid tag already assigned to this mod
                    const existingValid = await prisma.modTag.findUnique({
                        where: {
                            modId_tagId: {
                                modId: modTag.modId,
                                tagId: validNaTag.id
                            }
                        }
                    });

                    if (!existingValid) {
                        try {
                            // Create new link
                            await prisma.modTag.create({
                                data: {
                                    modId: modTag.modId,
                                    tagId: validNaTag.id,
                                    isExternal: modTag.isExternal,
                                    externalLink: modTag.externalLink
                                }
                            });
                        } catch (e) {
                            console.error(`Failed to migrate mod ${modTag.modId}:`, e);
                        }
                    } else {
                        console.log(`Mod ${modTag.modId} already has valid tag. Skipping creation.`);
                    }

                    // Delete old link
                    await prisma.modTag.delete({
                        where: {
                            modId_tagId: {
                                modId: modTag.modId,
                                tagId: tag.id
                            }
                        }
                    });
                }
                console.log("Migration complete.");
            }

            // Delete the tag itself
            await prisma.tag.delete({ where: { id: tag.id } });
            console.log("✅ Deleted invalid duplicate tag.");
        }
    }
};

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Error:", error);
        process.exit(1);
    });
