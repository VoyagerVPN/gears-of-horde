import { db } from '@/lib/db';

async function main() {
    console.log('Start seeding tags...');

    // 1. Generic Tags
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

    // 2. Game Version Tags
    await db.tag.upsert({
        where: { category_value: { category: 'gamever', value: '1_0' } },
        update: {},
        create: {
            category: 'gamever',
            value: '1_0',
            displayName: 'V1.0',
            color: '#ef4444' // Red
        }
    });

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
