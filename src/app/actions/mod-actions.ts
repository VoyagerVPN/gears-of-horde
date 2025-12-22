'use server';

import { db as prisma } from "@/lib/db";
import { normalizeGameVersion } from "@/lib/utils";
import {
    findOrCreateAuthorTag,
    findOrCreateGenericTag,
    findOrCreateLangTag,
    findOrCreateGameVerTag
} from "@/lib/tag-utils";
import { ModDataSchema, type ModData } from "@/schemas";
import { validate, ok, err, type Result } from "@/lib/result";
import { revalidatePath } from "next/cache";
import { ROUTES } from "@/lib/routes";

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
            // Try to fix protocol if missing? simpler to just clear for now to pass validation
            links.download = '';
        } else if (typeof links.download === 'string' && links.download.trim() === '') {
            links.download = ''; // ensure empty string for schema
        }

        if (typeof links.discord === 'string' && links.discord.trim() !== '' && !isValidUrl(links.discord)) {
            links.discord = '';
        } else if (typeof links.discord === 'string' && links.discord.trim() === '') {
            links.discord = '';
        }

        // Filter community links - only keep entries with valid name AND url
        if (Array.isArray(links.community)) {
            links.community = links.community.filter((link: any) =>
                link &&
                typeof link.name === 'string' &&
                link.name.trim() !== '' &&
                typeof link.url === 'string' &&
                isValidUrl(link.url)
            );
        }

        // Filter donations links - only keep entries with valid name AND url
        if (Array.isArray(links.donations)) {
            links.donations = links.donations.filter((link: any) =>
                link &&
                typeof link.name === 'string' &&
                link.name.trim() !== '' &&
                typeof link.url === 'string' &&
                isValidUrl(link.url)
            );
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
        data.screenshots = data.screenshots.filter((url: any) =>
            typeof url === 'string' && isValidUrl(url)
        );
    }

    // Clean up video URLs (empty strings are allowed by schema)
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

    // Process Localizations (url field is optional but must be valid URL if present)
    if (Array.isArray(data.localizations)) {
        data.localizations = data.localizations.map((loc: any) => {
            if (loc && typeof loc.url === 'string' && loc.url.trim() !== '' && !isValidUrl(loc.url)) {
                return { ...loc, url: undefined }; // remove invalid url
            }
            if (loc && typeof loc.url === 'string' && loc.url.trim() === '') {
                return { ...loc, url: undefined }; // clean empty string
            }
            return loc;
        });
    }

    // Process Tags (externalLink is optional)
    if (Array.isArray(data.tags)) {
        data.tags = data.tags.map((tag: any) => {
            if (tag && typeof tag.externalLink === 'string' && tag.externalLink.trim() !== '' && !isValidUrl(tag.externalLink)) {
                return { ...tag, externalLink: undefined };
            }
            if (tag && typeof tag.externalLink === 'string' && tag.externalLink.trim() === '') {
                return { ...tag, externalLink: undefined };
            }
            return tag;
        });
    }

    return data;
}

export async function createMod(rawData: unknown): Promise<Result<{ slug: string }>> {
    // Pre-process raw data to clean up empty/incomplete link entries
    const preprocessedData = preprocessModData(rawData);

    // Validate input with Zod schema
    const validated = validate(ModDataSchema, preprocessedData);
    if (!validated.success) {
        return validated;
    }
    const data = validated.data;

    try {

        // Check if mod with slug already exists
        const existingMod = await prisma.mod.findUnique({
            where: { slug: data.slug }
        });

        if (existingMod) {
            throw new Error(`Mod with slug '${data.slug}' already exists`);
        }

        // 1. Prepare Tag Data
        // We will link these AFTER mod creation or as part of nested create
        const tagLinks = [];

        // Check if author tags are already in data.tags
        const authorTagsFromTags = data.tags.filter(t => t.category === 'author');

        // If no author tags in data.tags, fall back to data.author (legacy field)
        // Otherwise, use authors from tags and update data.author for backwards compatibility
        let effectiveAuthor = data.author;
        if (authorTagsFromTags.length > 0) {
            // Use the first author tag as the primary author
            effectiveAuthor = authorTagsFromTags[0].displayName;
        } else if (data.author && data.author !== 'Author Name') {
            // Only create author tag from data.author if it's not the placeholder
            const authorTag = await findOrCreateAuthorTag(data.author);
            tagLinks.push({
                tag: { connect: { id: authorTag.id } }
            });
        }

        // Game Version Tag
        const gameVerTag = await findOrCreateGameVerTag(normalizeGameVersion(data.gameVersion));
        tagLinks.push({
            tag: { connect: { id: gameVerTag.id } }
        });

        // Other Tags
        for (const t of data.tags) {
            let tag;
            const category = t.category || 'tag';

            if (category === 'lang') {
                tag = await findOrCreateLangTag(t.displayName, t.value || t.displayName.substring(0, 2).toUpperCase());
            } else if (category === 'author') {
                tag = await findOrCreateAuthorTag(t.displayName);
            } else if (category === 'gamever') {
                tag = await findOrCreateGameVerTag(normalizeGameVersion(t.displayName));
            } else {
                tag = await findOrCreateGenericTag(t.displayName);
            }

            tagLinks.push({
                isExternal: t.isExternal || false,
                externalLink: t.externalLink || null,
                tag: { connect: { id: tag.id } }
            });
        }

        // Create the mod
        await prisma.mod.create({
            data: {
                slug: data.slug,
                title: data.title,
                version: data.version,
                author: effectiveAuthor,
                description: data.description,
                status: data.status,
                gameVersion: normalizeGameVersion(data.gameVersion),
                bannerUrl: data.bannerUrl || null,
                isSaveBreaking: data.isSaveBreaking,
                features: data.features,
                tags: {
                    create: tagLinks
                },
                installationSteps: data.installationSteps,
                // Zod validates these, Prisma accepts them as Json
                links: data.links,
                videos: data.videos,
                changelog: data.changelog,
                localizations: data.localizations,

                // Stats are individual columns
                rating: data.stats.rating,
                ratingCount: data.stats.ratingCount,
                downloads: data.stats.downloads,
                views: data.stats.views,

                screenshots: data.screenshots,
            }
        });

        // 3. Create News Item for New Mod
        // Find 'NEW' tag
        const newTag = await prisma.tag.findUnique({
            where: {
                category_value: {
                    category: 'newscat',
                    value: 'new'
                }
            }
        });

        if (newTag) {
            await prisma.news.create({
                data: {
                    modSlug: data.slug,
                    modName: data.title,
                    modVersion: data.version,
                    gameVersion: normalizeGameVersion(data.gameVersion),
                    actionText: 'added',
                    content: `Version ${data.version} is now available.`,
                    description: `${data.title} was added to Gears of Horde`,
                    date: new Date(),
                    wipeRequired: false,
                    tags: [
                        { displayName: newTag.displayName, color: newTag.color, category: newTag.category }
                    ]
                }
            });
        }

        revalidatePath(ROUTES.mods);
        revalidatePath(`/${data.slug}`);

        return ok({ slug: data.slug });
    } catch (error) {
        console.error("Failed to create mod:", error);
        return err(error instanceof Error ? error.message : "Unknown error");
    }
}
