import 'dotenv/config';
import { db as prisma } from '../src/lib/db';

async function main() {
    console.log('Starting author tag synchronization...');

    const mods = await prisma.mod.findMany({
        include: {
            tags: {
                include: {
                    tag: true
                }
            }
        }
    });

    console.log(`Found ${mods.length} mods to process.`);

    for (const mod of mods) {
        if (!mod.author) {
            console.log(`Skipping mod ${mod.slug} (no author)`);
            continue;
        }

        const authorName = mod.author;
        const authorValue = authorName.toLowerCase();

        // Check if author tag already linked
        const hasAuthorTag = mod.tags.some(mt => mt.tag.category === 'author' && mt.tag.value === authorValue);

        if (hasAuthorTag) {
            // console.log(`Mod ${mod.slug} already has author tag.`);
            continue;
        }

        console.log(`Syncing author for mod ${mod.slug}: ${authorName}`);

        // 1. Find or create author tag
        let authorTag = await prisma.tag.findFirst({
            where: {
                category: 'author',
                value: authorValue
            }
        });

        if (!authorTag) {
            console.log(`  Creating new author tag: ${authorName}`);
            authorTag = await prisma.tag.create({
                data: {
                    category: 'author',
                    value: authorValue,
                    displayName: authorName
                }
            });
        }

        // 2. Remove any other author tags (cleanup)
        const otherAuthorTags = mod.tags.filter(mt => mt.tag.category === 'author' && mt.tag.value !== authorValue);
        if (otherAuthorTags.length > 0) {
            console.log(`  Removing ${otherAuthorTags.length} incorrect author tags...`);
            await prisma.modTag.deleteMany({
                where: {
                    modId: mod.slug,
                    tagId: {
                        in: otherAuthorTags.map(mt => mt.tagId)
                    }
                }
            });
        }

        // 3. Link new author tag
        console.log(`  Linking author tag...`);
        await prisma.modTag.create({
            data: {
                modId: mod.slug,
                tagId: authorTag.id
            }
        });
    }

    console.log('Synchronization complete.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
