'use server';

import { db as prisma } from "@/lib/db";
import { ModData, TranslationSuggestion, ModStatusType, ModChangelog, ModLocalization } from "@/types/mod";
import { PrismaModWithTags, mapPrismaTagToTagData, mapPrismaModToModData, ModLinksJson, ModVideosJson, ModChangelogJson, ModLocalizationJson } from "@/types/database";
import { revalidatePath } from "next/cache";
import { ROUTES } from "@/lib/routes";
import { normalizeGameVersion } from "@/lib/utils";
import {
    findOrCreateAuthorTag,
    findOrCreateGameVerTag,
    findOrCreateGenericTag,
    findOrCreateLangTag,
    findOrCreateNewscatTag,
    removeModTagsByCategory,
    batchLinkTagsToMod,
    linkTagToModWithMetadata,
    AUTHOR_TAG_COLOR
} from "@/lib/tag-utils";

export async function fetchAllMods(): Promise<ModData[]> {
    const mods = await prisma.mod.findMany({
        orderBy: { updatedAt: 'desc' },
        include: {
            tags: {
                include: {
                    tag: true
                }
            }
        }
    });

    // Map Prisma result to ModData interface
    return mods.map((mod: PrismaModWithTags) => mapPrismaModToModData(mod));
}

export async function fetchModBySlug(slug: string): Promise<ModData | null> {
    const mod = await prisma.mod.findUnique({
        where: { slug },
        include: {
            tags: {
                include: {
                    tag: true
                }
            }
        }
    });

    if (!mod) return null;

    return mapPrismaModToModData(mod as PrismaModWithTags);
}

export async function fetchPendingSuggestions(): Promise<TranslationSuggestion[]> {
    const suggestions = await prisma.translationSuggestion.findMany({
        where: { status: 'pending' },
        orderBy: { submittedAt: 'desc' }
    });

    return suggestions.map(s => ({
        id: s.id,
        modSlug: s.modSlug,
        modName: s.modName,
        languageCode: s.languageCode,
        languageName: s.languageName,
        author: s.author,
        link: s.link,
        status: s.status as 'pending' | 'approved' | 'rejected', // Cast since DB string might be wider, but defaults match
        submittedAt: s.submittedAt.toISOString()
    }));
}

export async function approveTranslationSuggestion(id: string) {
    try {
        const suggestion = await prisma.translationSuggestion.findUnique({ where: { id } });
        if (!suggestion) return;

        const mod = await prisma.mod.findUnique({ where: { slug: suggestion.modSlug } });
        if (!mod) return;

        // Create new lang tag if it doesn't exist
        const langTag = await findOrCreateLangTag(suggestion.languageName, suggestion.languageCode);

        // Link to mod with metadata
        await linkTagToModWithMetadata(suggestion.modSlug, langTag.id, {
            isExternal: true,
            externalLink: suggestion.link
        });

        // Update Suggestion status
        await prisma.translationSuggestion.update({
            where: { id },
            data: { status: 'approved' }
        });

        return { success: true };
    } catch (error) {
        console.error("Failed to approve suggestion:", error);
        return { success: false, error };
    }
}

export async function rejectTranslationSuggestion(id: string) {
    try {
        await prisma.translationSuggestion.update({
            where: { id },
            data: { status: 'rejected' }
        });
        return { success: true };
    } catch (error) {
        console.error("Failed to reject suggestion:", error);
        return { success: false, error };
    }
}

export async function updateModAction(slug: string, updates: any) {
    // 1. Extract Mod fields safely
    const modFields = [
        'title', 'version', 'author', 'description', 'status', 'gameVersion',
        'bannerUrl', 'isSaveBreaking', 'features', 'installationSteps', 'links', 'videos',
        'changelog', 'localizations', 'stats', 'screenshots', 'createdAt', 'updatedAt'
    ];

    const prismaUpdates: any = {};

    // If this is a Quick Update (has eventType), we treat 'description' as News Title, 
    // so we exclude it from mod updates to prevent overwriting the main description.
    const isQuickUpdate = !!updates.eventType;

    for (const field of modFields) {
        if (updates[field] !== undefined) {
            // Skip description if it's a quick update
            if (field === 'description' && isQuickUpdate) continue;
            prismaUpdates[field] = updates[field];
        }
    }

    // Handle stats mapping if present
    if (updates.stats) {
        prismaUpdates.rating = updates.stats.rating;
        prismaUpdates.ratingCount = updates.stats.ratingCount;
        prismaUpdates.downloads = updates.stats.downloads;
        prismaUpdates.views = updates.stats.views;
        delete prismaUpdates.stats;
    }

    // 2. Handle News Creation (Quick Update)
    if (isQuickUpdate && updates.changes) {
        // Create News Item - find or create the tag for eventType
        const tag = await findOrCreateNewscatTag(updates.eventType);

        const newsContent = Array.isArray(updates.changes)
            ? updates.changes.map((c: string) => `- ${c}`).join('\n')
            : updates.changes;

        await prisma.news.create({
            data: {
                title: updates.description || `${updates.version} Released`,
                content: newsContent,
                date: updates.date ? new Date(updates.date) : new Date(),
                wipeRequired: updates.isSaveBreaking || false,
                sourceUrl: updates.sourceUrl || null,
                modId: slug,
                tags: {
                    create: {
                        tagId: tag.id
                    }
                }
            }
        });

        // Update Mod Changelog
        if (!updates.changelog) {
            const currentMod = await prisma.mod.findUnique({ where: { slug }, select: { changelog: true } });
            const currentChangelog = (currentMod?.changelog as unknown as ModChangelogJson[]) || [];

            const newLog = {
                version: updates.version,
                date: updates.date || new Date().toISOString(),
                changes: updates.changes,
                isSaveBreaking: updates.isSaveBreaking
            };

            prismaUpdates.changelog = [newLog, ...currentChangelog];
        }
    }

    // 3. Update Mod
    await prisma.mod.update({
        where: { slug },
        data: prismaUpdates
    });

    // 4. Handle Tags - Separate logic for each category
    // - author: auto-created from mod.author field
    // - gamever: auto-created from mod.gameVersion field
    // - tag: manually managed by user

    const tagIdsToLink: string[] = [];

    // 4a. Handle AUTHOR tags (from tags array with category='author')
    await removeModTagsByCategory(slug, 'author');

    // Get author tags from updates.tags array
    interface TagUpdate { displayName: string; category?: string }
    const authorTagsFromUpdates: TagUpdate[] = updates.tags?.filter((t: TagUpdate) => t.category === 'author') || [];

    // If no author tags in updates but there's an author field, use that as fallback
    if (authorTagsFromUpdates.length === 0 && updates.author) {
        authorTagsFromUpdates.push({ displayName: updates.author, category: 'author' });
    }

    // Process each author tag
    for (const authorData of authorTagsFromUpdates) {
        const authorName = typeof authorData === 'string' ? authorData : authorData.displayName;
        if (!authorName) continue;

        const authorTag = await findOrCreateAuthorTag(authorName);
        tagIdsToLink.push(authorTag.id);

        // Update mod.author field with first author for backwards compatibility
        if (tagIdsToLink.length === 1) {
            await prisma.mod.update({
                where: { slug },
                data: { author: authorName }
            });
        }
    }

    // 4b. Handle GAMEVER tag (auto from gameVersion field)
    const rawGameVersion = updates.gameVersion || (await prisma.mod.findUnique({ where: { slug }, select: { gameVersion: true } }))?.gameVersion;
    if (rawGameVersion) {
        // Normalize game version to always have "V" prefix (e.g., "2.2" → "V2.2")
        const gameVersion = normalizeGameVersion(rawGameVersion);

        // Update mod.gameVersion with normalized value if it changed
        if (gameVersion !== rawGameVersion) {
            await prisma.mod.update({
                where: { slug },
                data: { gameVersion }
            });
        }

        // Remove old gamever tags
        await removeModTagsByCategory(slug, 'gamever');

        // Find or create gamever tag
        let gameVerTag = await findOrCreateGameVerTag(gameVersion);

        // Check if this is a new tag OR existing tag without color
        if (!gameVerTag.color) {
            // Recalculate gamever colors when new version is added or missing color
            const { recalculateGameVersionColors } = await import('@/lib/tags');
            await recalculateGameVersionColors(prisma);

            // Refetch tag to get the assigned color
            const updatedTag = await prisma.tag.findUnique({ where: { id: gameVerTag.id } });
            if (updatedTag) {
                gameVerTag = updatedTag as any;
            }
        }

        tagIdsToLink.push(gameVerTag.id);
    }

    // 4c. Handle TAG category (manually managed)
    if (updates.tags) {
        // Remove old tag: category tags
        await removeModTagsByCategory(slug, 'tag');

        // Get only tags with category 'tag' from the updates
        const manualTags = updates.tags.filter((t: TagUpdate) => t.category === 'tag' || !t.category);

        for (const tagData of manualTags) {
            const tagName = typeof tagData === 'string' ? tagData : tagData.displayName;
            if (!tagName) continue;

            const tag = await findOrCreateGenericTag(tagName);
            tagIdsToLink.push(tag.id);
        }
    }

    // 4d. Handle LANG tags
    if (updates.tags) {
        // Remove old lang tags from this mod
        await removeModTagsByCategory(slug, 'lang');

        // Filter tags with category 'lang'
        const langTags = updates.tags.filter((t: any) => t.category === 'lang');

        for (const langData of langTags) {
            // value is usually the code, displayName is name
            const langName = langData.displayName;
            const langCode = langData.value || langData.displayName.substring(0, 2).toUpperCase();

            const langTag = await findOrCreateLangTag(langName, langCode);

            // Link with metadata
            await linkTagToModWithMetadata(slug, langTag.id, {
                isExternal: langData.isExternal,
                externalLink: langData.externalLink
            });
        }
    }

    // 4e. Create all tag links using batch operation
    await batchLinkTagsToMod(slug, tagIdsToLink);

    revalidatePath(ROUTES.mods);
    revalidatePath(`/mod/${slug}`);
}

export async function deleteModAction(slug: string) {
    await prisma.mod.delete({
        where: { slug }
    });
    revalidatePath(ROUTES.mods);
}
