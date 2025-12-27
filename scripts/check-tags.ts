import { db } from '@/lib/db';

async function main() {
    const tags = await db.tag.findMany({
        include: {
            _count: {
                select: { modTags: true }
            }
        }
    });
    console.log('Total tags:', tags.length);
    console.log('Tags:', JSON.stringify(tags, null, 2));
}

main();
