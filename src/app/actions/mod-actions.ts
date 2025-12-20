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

export async function createMod(rawData: unknown): Promise<Result<{ slug: string }>> {
    // Validate input with Zod schema
    const validated = validate(ModDataSchema, rawData);
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

        // Author Tag
        const authorTag = await findOrCreateAuthorTag(data.author);
        tagLinks.push({
            tag: { connect: { id: authorTag.id } }
        });

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
                author: data.author,
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
                    title: `${data.title} was added to Gears of Horde`,
                    content: `Version ${data.version} is now available.`,
                    date: new Date(),
                    wipeRequired: false,
                    modId: data.slug,
                    tags: {
                        create: {
                            tagId: newTag.id
                        }
                    }
                }
            });
        }

        revalidatePath(ROUTES.mods);
        revalidatePath(`/mod/${data.slug}`);

        return ok({ slug: data.slug });
    } catch (error) {
        console.error("Failed to create mod:", error);
        return err(error instanceof Error ? error.message : "Unknown error");
    }
}
