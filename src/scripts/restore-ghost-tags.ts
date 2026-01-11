
import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

async function run() {
    const { db } = await import("@/lib/db");
    const { findOrCreateGameVerTag, linkTagToMod } = await import("@/lib/tag-utils");

    console.log("Scanning for ghost tags...");

    // 1. Get all Mods with their gameVersions
    const mods = await db.mod.findMany({
        select: {
            slug: true,
            title: true,
            gameVersion: true,
            tags: {
                select: {
                    tag: true
                }
            }
        }
    });

    console.log(`Found ${mods.length} mods.`);

    let restoredCount = 0;
    const ghostTags = new Map<string, string[]>(); // version -> modSlugs

    // 2. Analyze each mod
    for (const mod of mods) {
        const gvString = mod.gameVersion;
        if (!gvString || gvString === 'Unknown') continue;

        // Check if this mod actually has a tag that matches this string (by value or displayName)
        // We act conservative: if the mod has ANY gamever tag, we assume it's fine? 
        // No, the user specifically mentioned A20.5B2 which they see on the mod card but isn't in DB.
        // It's possible the mod has a gamever tag linked, but `mod.gameVersion` is different.
        // BUT the user's issue implies the tag is MISSING from the DB entirely.

        // Let's verify if a tag EXISTS in the DB for this string.
        // We use the same normalization logic as findOrCreateGameVerTag to guess the value.
        // But simpler: let's just use findOrCreateGameVerTag which does the lookup.
        // However, we only want to act if it's "missing".

        // Actually, the user wants us to "apply them to the database".
        // Safety check: Does this mod already have a gamever tag linked?
        const hasGameVerTag = mod.tags.some(t => t.tag.category === 'gamever');

        // If it has NO gamever tag, but HAS a gameVersion string, it's definitely a ghost.
        // If it HAS a gamever tag, but the string is different... that's a sync issue.
        // Given the previous bug (string not updating), we likely have mods with NEW tags but OLD strings.
        // BUT the user specifically asked about "A20.5B2" which they saw.

        // Let's look for cases where `mod.gameVersion` is NOT represented in `mod.tags`.
        const isRepresented = mod.tags.some(t =>
            t.tag.category === 'gamever' &&
            (t.tag.displayName === gvString || t.tag.value === gvString.toLowerCase())
        );

        if (!isRepresented) {
            if (!ghostTags.has(gvString)) {
                ghostTags.set(gvString, []);
            }
            ghostTags.get(gvString)?.push(mod.slug);
        }
    }

    console.log(`Found ${ghostTags.size} unique ghost versions.`);

    // 3. Restore
    for (const [version, slugs] of ghostTags) {
        console.log(`Restoring tag for version "${version}" (${slugs.length} mods)...`);

        // This helper will find it if it exists (unlinked) or create it if missing.
        const tag = await findOrCreateGameVerTag(version);

        console.log(`  -> Tag ID: ${tag.id} (${tag.displayName})`);

        // Link to mods
        for (const slug of slugs) {
            process.stdout.write(`    Linking to ${slug}... `);
            await linkTagToMod(slug, tag.id);
            console.log("Done.");
        }
        restoredCount++;
    }

    console.log(`\nOperation complete. Restored/Linked ${restoredCount} distinct versions.`);
}

run().catch(console.error);
