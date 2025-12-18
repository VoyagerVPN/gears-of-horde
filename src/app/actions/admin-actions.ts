'use server';

import { db as prisma } from "@/lib/db";
import { ModData, TranslationSuggestion, ModStatusType } from "@/types/mod";
import { revalidatePath } from "next/cache";
import { ROUTES } from "@/lib/routes";

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
    return mods.map((mod: any) => ({
        ...mod,
        bannerUrl: mod.bannerUrl ?? undefined, // Convert null to undefined
        status: mod.status as ModStatusType,
        tags: mod.tags.map((mt: any) => ({
            id: mt.tag.id,
            displayName: mt.tag.displayName,
            color: mt.tag.color,
            category: mt.tag.category
        })),
        createdAt: mod.createdAt.toISOString(),
        updatedAt: mod.updatedAt.toISOString(),
        links: mod.links as any,
        videos: mod.videos as any,
        changelog: mod.changelog as any,
        localizations: mod.localizations as any,
        stats: {
            rating: mod.rating,
            ratingCount: mod.ratingCount,
            downloads: mod.downloads,
            views: mod.views
        }
    }));
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

    return {
        ...mod,
        bannerUrl: mod.bannerUrl ?? undefined, // Convert null to undefined
        status: mod.status as ModStatusType,
        tags: mod.tags.map((mt: any) => ({
            id: mt.tag.id,
            displayName: mt.tag.displayName,
            color: mt.tag.color,
            category: mt.tag.category
        })),
        createdAt: mod.createdAt.toISOString(),
        updatedAt: mod.updatedAt.toISOString(),
        links: mod.links as any,
        videos: mod.videos as any,
        changelog: mod.changelog as any,
        localizations: mod.localizations as any,
        stats: {
            rating: mod.rating,
            ratingCount: mod.ratingCount,
            downloads: mod.downloads,
            views: mod.views
        }
    };
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

        // Create new localization entry
        const newLocalization = {
            code: suggestion.languageCode,
            name: suggestion.languageName,
            type: 'external',
            url: suggestion.link
        };

        // Update Mod's localizations (replace existing if same code, or append)
        const currentLocalizations = (mod.localizations as any[]) || [];
        const updatedLocalizations = [
            ...currentLocalizations.filter((l: any) => l.code !== suggestion.languageCode),
            newLocalization
        ];

        // Transaction to ensure atomicity
        await prisma.$transaction([
            prisma.mod.update({
                where: { slug: suggestion.modSlug },
                data: { localizations: updatedLocalizations }
            }),
            prisma.translationSuggestion.update({
                where: { id },
                data: { status: 'approved' }
            })
        ]);

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
        // Create News Item
        const tagValue = updates.eventType.toLowerCase(); // e.g., 'update'

        // Find or create the tag for eventType
        let tag = await prisma.tag.findUnique({
            where: {
                category_value: {
                    category: 'newscat',
                    value: tagValue
                }
            }
        });

        if (!tag) {
            tag = await prisma.tag.create({
                data: {
                    category: 'newscat',
                    value: tagValue,
                    displayName: updates.eventType.charAt(0).toUpperCase() + updates.eventType.slice(1).toLowerCase()
                }
            });
        }

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
            const currentChangelog = (currentMod?.changelog as any[]) || [];

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
    // Remove old author tags first
    await prisma.modTag.deleteMany({
        where: {
            modId: slug,
            tag: { category: 'author' }
        }
    });

    // Get author tags from updates.tags array
    const authorTagsFromUpdates = updates.tags?.filter((t: any) => t.category === 'author') || [];

    // If no author tags in updates but there's an author field, use that as fallback
    if (authorTagsFromUpdates.length === 0 && updates.author) {
        authorTagsFromUpdates.push({ displayName: updates.author, category: 'author' });
    }

    // Process each author tag
    for (const authorData of authorTagsFromUpdates) {
        const authorName = typeof authorData === 'string' ? authorData : authorData.displayName;
        if (!authorName) continue;

        // Find or create author tag with blue color
        let authorTag = await prisma.tag.findUnique({
            where: {
                category_value: {
                    category: 'author',
                    value: authorName.toLowerCase()
                }
            }
        });

        if (!authorTag) {
            authorTag = await prisma.tag.create({
                data: {
                    category: 'author',
                    value: authorName.toLowerCase(),
                    displayName: authorName,
                    color: '#3b82f6' // blue-500
                }
            });
        }

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
    const gameVersion = updates.gameVersion || (await prisma.mod.findUnique({ where: { slug }, select: { gameVersion: true } }))?.gameVersion;
    if (gameVersion) {
        // Remove old gamever tags
        await prisma.modTag.deleteMany({
            where: {
                modId: slug,
                tag: { category: 'gamever' }
            }
        });

        // Convert "V2.4" to "2_4" for storage
        const gameVerValue = gameVersion.replace(/^V/, '').replace('.', '_');

        // Find or create gamever tag
        let gameVerTag = await prisma.tag.findUnique({
            where: {
                category_value: {
                    category: 'gamever',
                    value: gameVerValue
                }
            }
        });

        if (!gameVerTag) {
            gameVerTag = await prisma.tag.create({
                data: {
                    category: 'gamever',
                    value: gameVerValue,
                    displayName: gameVersion
                }
            });

            // Recalculate gamever colors when new version is added
            const { recalculateGameVersionColors } = await import('@/lib/tags');
            await recalculateGameVersionColors(prisma);
        }

        tagIdsToLink.push(gameVerTag.id);
    }

    // 4c. Handle TAG category (manually managed)
    if (updates.tags) {
        // Remove old tag: category tags
        await prisma.modTag.deleteMany({
            where: {
                modId: slug,
                tag: { category: 'tag' }
            }
        });

        // Get only tags with category 'tag' from the updates
        const manualTags = updates.tags.filter((t: any) => t.category === 'tag' || !t.category);

        for (const tagData of manualTags) {
            const tagName = typeof tagData === 'string' ? tagData : tagData.displayName;
            if (!tagName) continue;

            // Find or create tag
            let tag = await prisma.tag.findFirst({
                where: {
                    category: 'tag',
                    displayName: { equals: tagName, mode: 'insensitive' }
                }
            });

            if (!tag) {
                tag = await prisma.tag.create({
                    data: {
                        category: 'tag',
                        value: tagName.toLowerCase().replace(/\s+/g, '-'),
                        displayName: tagName
                    }
                });
            }

            tagIdsToLink.push(tag.id);
        }
    }

    // 4d. Create all tag links (skip duplicates)
    for (const tagId of tagIdsToLink) {
        const exists = await prisma.modTag.findUnique({
            where: { modId_tagId: { modId: slug, tagId } }
        });

        if (!exists) {
            await prisma.modTag.create({
                data: { modId: slug, tagId }
            });
        }
    }

    revalidatePath(ROUTES.mods);
    revalidatePath(`/mod/${slug}`);
}

export async function deleteModAction(slug: string) {
    await prisma.mod.delete({
        where: { slug }
    });
    revalidatePath(ROUTES.mods);
}
