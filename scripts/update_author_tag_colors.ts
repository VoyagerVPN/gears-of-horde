/**
 * Update all author tags to use cyan color
 * Run with: npx tsx scripts/update_author_tag_colors.ts
 */

import { db as prisma } from '../src/lib/db';
import { AUTHOR_TAG_COLOR } from '../src/lib/tag-colors';

async function updateAuthorTagColors() {
    console.log(`Updating all author tags to color: ${AUTHOR_TAG_COLOR} (cyan-400)`);

    const result = await prisma.tag.updateMany({
        where: {
            category: 'author'
        },
        data: {
            color: AUTHOR_TAG_COLOR
        }
    });

    console.log(`✅ Updated ${result.count} author tags to ${AUTHOR_TAG_COLOR} (cyan-400)`);
}

updateAuthorTagColors()
    .then(() => {
        console.log('Done!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Error updating author tag colors:', error);
        process.exit(1);
    });
