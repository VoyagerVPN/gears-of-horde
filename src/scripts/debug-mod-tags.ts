
import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

async function run() {
    const { db } = await import("@/lib/db");

    // 1. Check Scavengers mod
    const modSlug = 'scavengers-of-the-living-dead';
    const mod = await db.mod.findUnique({
        where: { slug: modSlug },
        include: {
            tags: {
                include: { tag: true }
            }
        }
    });

    if (!mod) {
        console.log(`Mod ${modSlug} not found.`);
        return;
    }

    console.log(`\nMod: ${mod.title} (${mod.slug})`);
    console.log(`GameVersion Field: ${mod.gameVersion}`);
    console.log("Linked Tags:");

    for (const link of mod.tags) {
        const tag = link.tag;
        // Count usage of this tag
        const count = await db.modTag.count({
            where: { tagId: tag.id }
        });

        console.log(`  - [${tag.category}] ${tag.displayName} (ID: ${tag.id}, Value: ${tag.value})`);
        console.log(`    -> Actual Usage Count in DB: ${count}`);
    }

    // 2. Also check if "A20.5B2" still exists (it shouldn't if merged)
    const ghostTag = await db.tag.findFirst({
        where: { value: 'a20_5b2' } // normalized
    });
    if (ghostTag) {
        console.log(`\nWARNING: Ghost tag 'A20.5B2' still exists! ID: ${ghostTag.id}`);
    } else {
        console.log(`\nConfirmed: 'A20.5B2' tag is gone.`);
    }

    // 3. List all mods with A20 tag
    const a20Tag = await db.tag.findFirst({
        where: { value: 'a20' }
    });

    if (a20Tag) {
        const modTags = await db.modTag.findMany({
            where: { tagId: a20Tag.id },
            include: { mod: { select: { title: true, slug: true } } }
        });

        console.log(`\nTag [gamever] A20 has ${modTags.length} mods:`);
        modTags.forEach(mt => {
            console.log(`  - ${mt.mod.title} (${mt.mod.slug})`);
        });
    }
}

run().catch(console.error);
