const fs = require('fs');
const path = require('path');

const markdownPath = 'c:\\gears-of-horde\\GoHDB.md';
const outputPath = 'c:\\gears-of-horde\\extracted_mods.json';

const skipMods = [
    'Afterlife',
    'The MeanOnes',
    'TheMEanOnes'
];

function slugify(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

// Status normalization
function normalizeStatus(statusText) {
    if (!statusText) return 'unknown';
    const s = statusText.toLowerCase();

    if (s.includes('active development') || s.includes('finished') || s.includes('completed')) return 'active';
    if (s.includes('pause') || s.includes('hold')) return 'on_hold';
    if (s.includes('discontinued') || s.includes('abandoned')) return 'discontinued';
    if (s.includes('to be released') || s.includes('upcoming') || s.includes('planned')) return 'upcoming';
    if (s.includes('active')) return 'active';

    return 'unknown';
}

function parseMod(modText) {
    const lines = modText.split('\n');

    // Initialize with schema-compatible structure - only essentials populated
    const mod = {
        slug: '',
        title: '',
        version: 'Unknown',
        author: 'Unknown',
        description: '',
        status: 'unknown',
        gameVersion: 'Unknown',
        bannerUrl: '',
        isSaveBreaking: false,
        features: [],
        links: {
            download: '',
            discord: '',
            community: [],
            donations: []
        },
        videos: {
            trailer: '',
            review: ''
        },
        localizations: [],
        screenshots: [],
        rating: 0,
        ratingCount: 0,
        downloads: "0",
        views: "0",
        downloadsThisMonth: 0,
        changelog: [],
        installationSteps: []
    };

    // 1. Extract Title & Slug
    const titleMatch = modText.match(/^# \*([^*]+)\*/m) || modText.match(/^# (.+)/m);
    if (titleMatch) {
        mod.title = titleMatch[1].trim().replace(/\*/g, '');
        mod.slug = slugify(mod.title);
    }

    if (!mod.title) return null;

    // 2. Mod Info Table (Status, Author, Version, Game Version)
    const infoHeaderIndex = lines.findIndex(l => l.includes('| Mod version | Game Version |'));
    if (infoHeaderIndex !== -1 && lines.length > infoHeaderIndex + 2) {
        const dataLine = lines[infoHeaderIndex + 2];
        const dataParts = dataLine.split('|').map(p => p.trim()).filter(p => p);
        if (dataParts.length >= 4) {
            mod.version = dataParts[0] || 'Unknown';
            mod.gameVersion = dataParts[1] || 'Unknown';
            mod.author = dataParts[2] || 'Unknown';
            mod.status = normalizeStatus(dataParts[3] || '');
        }
    }

    // 3. Description
    const aboutIndex = lines.findIndex(l => l.includes('## About this mod'));
    if (aboutIndex !== -1) {
        let descriptionBuffer = [];
        let i = aboutIndex + 1;
        while (i < lines.length) {
            const line = lines[i];
            if (line.trim().startsWith('## ') || line.trim().startsWith('<aside')) {
                if (!line.includes('About this mod') && line.trim() !== '') break;
            }
            const stripped = line.replace(/<[^>]*>/g, '').trim();
            if (stripped && !stripped.startsWith('##')) {
                descriptionBuffer.push(stripped);
            }
            i++;
        }
        mod.description = descriptionBuffer.join('\n');
    }

    // 4. Supported Languages (with links)
    const langIndex = lines.findIndex(l => l.includes('## Supported Languages'));
    if (langIndex !== -1) {
        let textFound = '';
        let i = langIndex + 1;
        while (i < lines.length && i < langIndex + 10) {
            const line = lines[i];
            if (line.trim().startsWith('## ') || line.trim().startsWith('---')) break;
            const stripped = line.replace(/<[^>]*>/g, '').trim();
            if (stripped && !stripped.startsWith('Supported Languages')) {
                textFound += stripped + ',';
            }
            i++;
        }

        const langs = textFound.split(/,|and/).map(s => s.trim()).filter(s => s);
        langs.forEach(langRaw => {
            const linkMatch = langRaw.match(/\[(.*?)\]\((.*?)\)/);
            if (linkMatch) {
                mod.localizations.push({
                    code: linkMatch[1].trim(),
                    name: linkMatch[1].trim(),
                    type: 'external',
                    url: linkMatch[2]
                });
            } else {
                if (langRaw.length > 0 && !langRaw.includes('http')) {
                    mod.localizations.push({
                        code: langRaw.trim(),
                        name: langRaw.trim(),
                        type: 'builtin'
                    });
                }
            }
        });
    }

    // 5. Links (Download, Discord, Community)
    const extractLinks = (sectionName) => {
        const idx = lines.findIndex(l => l.includes(`## ${sectionName}`));
        if (idx !== -1) {
            let i = idx + 1;
            while (i < lines.length) {
                const line = lines[i];
                if (line.trim().startsWith('## ') || line.trim().startsWith('---')) break;

                // Skip Notion artifacts
                if (line.includes('<img') || line.includes('notion.so') || line.includes('.svg')) {
                    i++;
                    continue;
                }

                // Skip markdown images
                if (line.trim().startsWith('![')) {
                    i++;
                    continue;
                }

                const urlMatch = line.match(/(https?:\/\/[^\s\)"'\]]+)/);
                if (urlMatch) {
                    const url = urlMatch[1].replace(/["']$/, '');
                    const lowerSection = sectionName.toLowerCase();

                    if (lowerSection.includes('trailer')) {
                        // Only accept real video links
                        if (!url.includes('.jpg') && !url.includes('.png')) {
                            mod.videos.trailer = url;
                        }
                    } else if (lowerSection.includes('review')) {
                        if (!url.includes('.jpg') && !url.includes('.png')) {
                            mod.videos.review = url;
                        }
                    } else if (lowerSection.includes('download')) {
                        if (!mod.links.download) {
                            mod.links.download = url;
                        } else {
                            mod.links.community.push({ url });
                        }
                    } else {
                        // Classify based on URL content
                        if (url.includes('discord')) {
                            mod.links.discord = url;
                        } else if (url.includes('patreon') || url.includes('paypal') || url.includes('boosty') || url.includes('ko-fi')) {
                            mod.links.donations.push({ url });
                        } else {
                            mod.links.community.push({ url });
                        }
                    }
                }
                i++;
            }
        }
    };

    extractLinks('Trailer');
    extractLinks('Review');
    extractLinks('Download');
    extractLinks('Useful Links');

    return mod;
}

try {
    const data = fs.readFileSync(markdownPath, 'utf8');
    const sections = data.split(/^---$/m);
    const mods = [];

    sections.forEach(section => {
        if (!section.trim()) return;
        const mod = parseMod(section);
        if (mod && mod.title) {
            const shouldSkip = skipMods.some(skip => mod.title.includes(skip));
            if (!shouldSkip) {
                mods.push(mod);
            } else {
                console.log(`Skipping: ${mod.title}`);
            }
        }
    });

    fs.writeFileSync(outputPath, JSON.stringify(mods, null, 2));
    console.log(`Successfully extracted ${mods.length} mods to ${outputPath}`);

} catch (e) {
    console.error('Error extracting mods:', e);
}
