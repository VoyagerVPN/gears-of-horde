
import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

async function run() {
    const { db } = await import("@/lib/db");

    // Mods to check
    const slugs = ['scavengers-of-the-living-dead', 'apocalypse-now', 'undead-legacy'];

    console.log("Checking tags for A20-related mods...");

    for (const slug of slugs) {
        const mod = await db.mod.findUnique({
            where: { slug },
            include: {
                tags: {
                    include: { tag: true }
                }
            }
        });

        if (!mod) {
            console.log(`\nMod '${slug}' not found.`);
            continue;
        }

        console.log(`\n[${mod.slug}] ${mod.title}`);
        console.log(`  Display GameVer: ${mod.gameVersion}`);
        console.log(`  Linked Tags:`);

        const gameVerTags = mod.tags.filter(t => t.tag.category === 'gamever');
        if (gameVerTags.length === 0) {
            console.log(`    (None)`);
        }
        for (const link of gameVerTags) {
            console.log(`    - ${link.tag.displayName} (Category: ${link.tag.category})`);
        }
    }
}

run().catch(console.error);
