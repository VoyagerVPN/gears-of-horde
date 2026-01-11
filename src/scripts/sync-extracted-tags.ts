import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

import fs from 'fs';
import path from 'path';

async function main() {
    // Dynamic imports to ensure env is loaded first
    const { db: prisma } = await import('../lib/db');
    const {
        findOrCreateAuthorTag,
        findOrCreateGameVerTag,
        findOrCreateStatusTag,
        findOrCreateLangTag,
        linkTagToModWithMetadata
    } = await import('../lib/tag-utils');

    try {
        console.log('Starting tag synchronization from extracted_mods.json...');

        const filePath = path.join(process.cwd(), 'extracted_mods.json');
        if (!fs.existsSync(filePath)) {
            console.error('File not found: extracted_mods.json');
            return;
        }

        const fileContent = fs.readFileSync(filePath, 'utf8');
        const mods = JSON.parse(fileContent);

        const skipKeywords = ['TheMeanOnes', 'afterlife', 'outback', 'viking'];
        const skipValues = ['unknown', 'n/a', ''];

        let processedCount = 0;
        let skippedCount = 0;
        let linkCount = 0;

        for (const modData of mods) {
            const title = modData.title || '';
            const slug = modData.slug || '';
            const author = modData.author || '';

            // Check if mod should be skipped
            const shouldSkipMod = skipKeywords.some(keyword =>
                title.toLowerCase().includes(keyword.toLowerCase()) ||
                slug.toLowerCase().includes(keyword.toLowerCase()) ||
                author.toLowerCase().includes(keyword.toLowerCase())
            );

            if (shouldSkipMod) {
                console.log(`Skipping mod: ${title} (${slug})`);
                skippedCount++;
                continue;
            }

            // Check if mod exists in DB
            const mod = await prisma.mod.findUnique({
                where: { slug }
            });

            if (!mod) {
                // console.log(`Mod not found in DB: ${slug}. Skipping tags.`);
                continue;
            }

            processedCount++;
            const tagsToLink = [];

            // 1. Author Tag
            if (modData.author && !skipValues.includes(modData.author.toLowerCase())) {
                // Handle multiple authors if comma separated
                const authors = modData.author.split(',').map((a: string) => a.trim());
                for (const authorName of authors) {
                    if (!skipValues.includes(authorName.toLowerCase())) {
                        const tag = await findOrCreateAuthorTag(authorName);
                        tagsToLink.push({ id: tag.id });
                    }
                }
            }

            // 2. Game Version Tag
            if (modData.gameVersion && !skipValues.includes(modData.gameVersion.toLowerCase())) {
                const tag = await findOrCreateGameVerTag(modData.gameVersion);
                tagsToLink.push({ id: tag.id });
            }

            // 3. Status Tag
            if (modData.status && !skipValues.includes(modData.status.toLowerCase())) {
                const tag = await findOrCreateStatusTag(modData.status);
                tagsToLink.push({ id: tag.id });
            }

            // 4. Localization Tags
            if (modData.localizations && Array.isArray(modData.localizations)) {
                for (const loc of modData.localizations) {
                    const langName = loc.name || loc.code;
                    if (langName && !skipValues.includes(langName.toLowerCase())) {
                        const tag = await findOrCreateLangTag(langName);
                        tagsToLink.push({
                            id: tag.id,
                            isExternal: loc.type === 'external',
                            externalLink: loc.url || null
                        });
                    }
                }
            }

            // Link tags to mod
            for (const tagInfo of tagsToLink) {
                await linkTagToModWithMetadata(slug, tagInfo.id, {
                    isExternal: (tagInfo as any).isExternal,
                    externalLink: (tagInfo as any).externalLink
                });
                linkCount++;
            }
        }

        console.log('\nSync complete!');
        console.log(`Processed mods: ${processedCount}`);
        console.log(`Skipped mods: ${skippedCount} (due to keywords)`);
        console.log(`Total tag links created/verified: ${linkCount}`);
    } finally {
        await prisma.$disconnect();
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    });
