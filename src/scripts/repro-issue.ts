
import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

async function run() {
    const { db } = await import("@/lib/db");
    const { mergeTags } = await import("@/app/actions/tag-actions");
    console.log("Starting reproduction script...");

    // 1. Setup Data
    const timestamp = Date.now();
    const oldTagVal = `old_${timestamp}`;
    const newTagVal = `new_${timestamp}`;

    // Create tags
    console.log("Creating tags...");
    const oldTag = await db.tag.create({
        data: { category: 'gamever', value: oldTagVal, displayName: 'OldVer' }
    });
    const newTag = await db.tag.create({
        data: { category: 'gamever', value: newTagVal, displayName: 'NewVer' }
    });

    // Create mod linked to old tag
    console.log("Creating mod...");
    const modSlug = `test_mod_${timestamp}`;
    await db.mod.create({
        data: {
            slug: modSlug,
            title: "Test Mod",
            version: "1.0",
            author: "Tester",
            description: "Test Description",
            status: "active",
            gameVersion: "OldVer", // The string field that should be updated
            links: {},
            videos: {},
            changelog: [],
            localizations: {},
            tags: {
                create: {
                    tagId: oldTag.id
                }
            }
        }
    });

    // 2. Execute Merge
    console.log("Merging tags...");
    await mergeTags({ sourceId: oldTag.id, targetId: newTag.id });

    // 3. Verify Result
    console.log("Verifying result...");
    const updatedMod = await db.mod.findUnique({
        where: { slug: modSlug },
        include: { tags: { include: { tag: true } } }
    });

    if (!updatedMod) {
        console.error("Mod not found!");
        return;
    }

    // Check tags
    const hasNewTag = updatedMod.tags.some(t => t.tag.value === newTagVal);
    const hasOldTag = updatedMod.tags.some(t => t.tag.value === oldTagVal);

    console.log(`Has new tag: ${hasNewTag}`);
    console.log(`Has old tag: ${hasOldTag}`);

    // CRITICAL CHECK: Check string field
    console.log(`Mod.gameVersion: "${updatedMod.gameVersion}"`);

    if (updatedMod.gameVersion === 'NewVer' || updatedMod.gameVersion === 'VNewVer') {
        console.log("SUCCESS: Mod.gameVersion was updated!");
    } else {
        console.error("FAILURE: Mod.gameVersion was NOT updated!");
    }

    // Cleanup
    console.log("Cleaning up...");
    await db.mod.delete({ where: { slug: modSlug } });
    await db.tag.deleteMany({ where: { id: { in: [newTag.id] } } });
    // Old tag should be gone already, but just in case
    try { await db.tag.delete({ where: { id: oldTag.id } }); } catch (e) { }
}

run().catch(console.error);
