'use server';


import { normalizeGameVersion } from "@/lib/utils";
import {
    findOrCreateAuthorTag,
    findOrCreateGenericTag,
    findOrCreateLangTag,
    findOrCreateGameVerTag
} from "@/lib/tag-utils";
import { ModDataSchema } from "@/schemas";
import { validate, ok, err, type Result } from "@/lib/result";
import { revalidatePath } from "next/cache";
import { ROUTES } from "@/lib/routes";
import { db } from "@/lib/db";
import { sanitizeHtml, stripHtml } from "@/lib/sanitization";

/**
 * Helper to check if a string looks like a valid URL
 */
function isValidUrl(str: string): boolean {
    if (!str || str.trim() === '') return false;
    try {
        new URL(str);
        return true;
    } catch {
        return false;
    }
}

/**
 * Preprocess mod data before validation to clean up incomplete/invalid entries
 */
function preprocessModData(rawData: unknown): unknown {
    if (!rawData || typeof rawData !== 'object') return rawData;

    const data = rawData as Record<string, unknown>;

    // Process links if present
    if (data.links && typeof data.links === 'object') {
        const links = data.links as Record<string, unknown>;

        // Clean up download/discord links to empty string if invalid
        if (typeof links.download === 'string' && links.download.trim() !== '' && !isValidUrl(links.download)) {
            links.download = '';
        } else if (typeof links.download === 'string' && links.download.trim() === '') {
            links.download = '';
        }

        if (typeof links.discord === 'string' && links.discord.trim() !== '' && !isValidUrl(links.discord)) {
            links.discord = '';
        } else if (typeof links.discord === 'string' && links.discord.trim() === '') {
            links.discord = '';
        }

        // Filter community links
        if (Array.isArray(links.community)) {
            links.community = links.community.filter((link: unknown) => {
                if (!link || typeof link !== 'object') return false;
                const l = link as Record<string, unknown>;
                return (
                    typeof l.name === 'string' &&
                    l.name.trim() !== '' &&
                    typeof l.url === 'string' &&
                    isValidUrl(l.url)
                );
            });
        }

        // Filter donations links
        if (Array.isArray(links.donations)) {
            links.donations = links.donations.filter((link: unknown) => {
                if (!link || typeof link !== 'object') return false;
                const l = link as Record<string, unknown>;
                return (
                    typeof l.name === 'string' &&
                    l.name.trim() !== '' &&
                    typeof l.url === 'string' &&
                    isValidUrl(l.url)
                );
            });
        }
    }

    // Banner URL
    if (typeof data.bannerUrl === 'string') {
        if (data.bannerUrl.trim() !== '' && !isValidUrl(data.bannerUrl)) {
            data.bannerUrl = '';
        } else if (data.bannerUrl.trim() === '') {
            data.bannerUrl = '';
        }
    }

    // Filter out empty screenshot URLs
    if (Array.isArray(data.screenshots)) {
        data.screenshots = data.screenshots.filter((url: unknown) =>
            typeof url === 'string' && isValidUrl(url)
        );
    }

    // video URLs
    if (data.videos && typeof data.videos === 'object') {
        const videos = data.videos as Record<string, unknown>;
        if (typeof videos.trailer === 'string' && videos.trailer.trim() !== '' && !isValidUrl(videos.trailer)) {
            videos.trailer = '';
        } else if (typeof videos.trailer === 'string' && videos.trailer.trim() === '') {
            videos.trailer = '';
        }

        if (typeof videos.review === 'string' && videos.review.trim() !== '' && !isValidUrl(videos.review)) {
            videos.review = '';
        } else if (typeof videos.review === 'string' && videos.review.trim() === '') {
            videos.review = '';
        }
    }

    // Localizations
    if (Array.isArray(data.localizations)) {
        data.localizations = data.localizations.map((loc: unknown) => {
            if (!loc || typeof loc !== 'object') return loc;
            const l = loc as Record<string, unknown>;

            if (typeof l.url === 'string' && l.url.trim() !== '' && !isValidUrl(l.url)) {
                return { ...l, url: undefined };
            }
            if (typeof l.url === 'string' && l.url.trim() === '') {
                return { ...l, url: undefined };
            }
            return loc;
        });
    }

    // Tags
    if (Array.isArray(data.tags)) {
        data.tags = data.tags.map((tag: unknown) => {
            if (!tag || typeof tag !== 'object') return tag;
            const t = tag as Record<string, unknown>;

            if (typeof t.externalLink === 'string' && t.externalLink.trim() !== '' && !isValidUrl(t.externalLink)) {
                return { ...t, externalLink: undefined };
            }
            if (typeof t.externalLink === 'string' && t.externalLink.trim() === '') {
                return { ...t, externalLink: undefined };
            }
            return tag;
        });

        const tagsArray = data.tags as Array<{ category?: string; displayName?: string }>;
        const authorTags = tagsArray.filter((tag) => tag && tag.category === 'author');
        if (authorTags.length > 0) {
            const firstAuthorName = authorTags[0]?.displayName;
            if (firstAuthorName && typeof firstAuthorName === 'string') {
                if (!data.author || data.author === '' || data.author === 'Author Name') {
                    data.author = firstAuthorName;
                }
            }
        }
    }

    return data;
}

export async function createMod(rawData: unknown): Promise<Result<{ slug: string }>> {
    const preprocessedData = preprocessModData(rawData);
    const validated = validate(ModDataSchema, preprocessedData);
    if (!validated.success) {
        return validated;
    }
    const data = validated.data;

    try {
        const { data: existingMod } = await db
            .from('Mod')
            .select('slug')
            .eq('slug', data.slug)
            .maybeSingle();

        if (existingMod) {
            throw new Error(`Mod with slug '${data.slug}' already exists`);
        }

        const tagLinks: { tagId: string; isExternal: boolean; externalLink: string | null }[] = [];
        const authorTagsFromTags = data.tags.filter(t => t.category === 'author');

        let effectiveAuthor = data.author;
        if (authorTagsFromTags.length > 0) {
            effectiveAuthor = authorTagsFromTags[0].displayName;
        } else if (data.author && data.author !== 'Author Name') {
            const authorTag = await findOrCreateAuthorTag(data.author);
            tagLinks.push({
                tagId: authorTag.id,
                isExternal: false,
                externalLink: null
            });
        }

        const gameVerTag = await findOrCreateGameVerTag(normalizeGameVersion(data.gameVersion));
        tagLinks.push({
            tagId: gameVerTag.id,
            isExternal: false,
            externalLink: null
        });

        for (const t of data.tags) {
            let tag;
            const category = t.category || 'tag';

            if (category === 'lang') {
                tag = await findOrCreateLangTag(t.displayName);
            } else if (category === 'author') {
                tag = await findOrCreateAuthorTag(t.displayName);
            } else if (category === 'gamever') {
                tag = await findOrCreateGameVerTag(normalizeGameVersion(t.displayName));
            } else {
                tag = await findOrCreateGenericTag(t.displayName);
            }

            tagLinks.push({
                tagId: tag.id,
                isExternal: t.isExternal || false,
                externalLink: t.externalLink || null
            });
        }

        // 1. Create the mod
        const { error: modError } = await db.from('Mod').insert({
            slug: data.slug,
            title: stripHtml(data.title),
            version: stripHtml(data.version),
            author: stripHtml(effectiveAuthor || ''),
            description: sanitizeHtml(data.description),
            status: data.status,
            gameVersion: normalizeGameVersion(data.gameVersion),
            bannerUrl: data.bannerUrl || null,
            isSaveBreaking: data.isSaveBreaking,
            features: (data.features || []).map((f: string) => sanitizeHtml(f)),
            installationSteps: (data.installationSteps || []).map((s: string) => sanitizeHtml(s)),
            links: data.links,
            videos: data.videos,
            changelog: (data.changelog || []).map((entry) => ({
                ...entry,
                version: stripHtml(entry.version),
                changes: (entry.changes || []).map((c: string) => sanitizeHtml(c))
            })),
            localizations: data.localizations,
            rating: data.stats.rating,
            ratingCount: data.stats.ratingCount,
            downloads: data.stats.downloads,
            views: data.stats.views,
            screenshots: data.screenshots,
        });

        if (modError) throw new Error(`Failed to insert mod: ${modError.message}`);

        // 2. Link tags
        if (tagLinks.length > 0) {
            const { error: tagError } = await db.from('ModTag').insert(
                tagLinks.map((tl) => ({
                    modId: data.slug,
                    tagId: tl.tagId,
                    isExternal: tl.isExternal,
                    externalLink: tl.externalLink
                }))
            );
            if (tagError) throw new Error(`Failed to link tags: ${tagError.message}`);
        }

        // 3. Create News Item
        const { data: newTag } = await db
            .from('Tag')
            .select('*')
            .eq('category', 'newscat')
            .eq('value', 'new')
            .single();

        if (newTag) {
            const { error: newsError } = await db.from('News').insert({
                modSlug: data.slug,
                modName: data.title,
                modVersion: data.version,
                gameVersion: normalizeGameVersion(data.gameVersion),
                actionText: 'added',
                content: `Version ${data.version} is now available.`,
                description: `${data.title} was added to Gears of Horde`,
                date: new Date().toISOString(),
                wipeRequired: false,
                newscatTagId: newTag.id,
                tags: [
                    { id: newTag.id, displayName: newTag.displayName, color: newTag.color, category: newTag.category }
                ]
            });
            if (newsError) console.error("Failed to create news item:", newsError.message);
        }

        revalidatePath(ROUTES.mods);
        revalidatePath(`/${data.slug}`);

        return ok({ slug: data.slug });
    } catch (error) {
        console.error("Failed to create mod:", error);
        return err(error instanceof Error ? error.message : "Unknown error");
    }
}
