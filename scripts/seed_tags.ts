import { db } from '@/lib/db';

async function main() {
    // Create some tags
    const tags = ['Overhaul', 'Magic', 'UI', 'Hardcore', 'Vanilla+', 'Weapons', 'NPC', 'Vehicles'];

    for (const tagName of tags) {
        await db.tag.upsert({
            where: { category_value: { category: 'tag', value: tagName.toLowerCase() } },
            update: {},
            create: {
                category: 'tag',
                value: tagName.toLowerCase(),
                displayName: tagName,
                color: '#3b82f6' // Blue
            }
        });
    }

    // Link to a mod (find first mod)
    const mod = await db.mod.findFirst();
    if (mod) {
        const tag = await db.tag.findFirst({ where: { value: 'overhaul' } });
        if (tag) {
            try {
                await db.modTag.create({
                    data: {
                        modId: mod.slug,
                        tagId: tag.id
                    }
                });
                console.log('Linked Overhaul tag to mod:', mod.title);
            } catch (e) {
                console.log('Tag already linked or error:', e);
            }
        }
    } else {
        console.log('No mods found to link tags to.');
    }
}

main();
