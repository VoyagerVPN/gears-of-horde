'use server';

import { db as prisma } from "@/lib/db";
import { ModData } from "@/types/mod";
import { revalidatePath } from "next/cache";
import { ROUTES } from "@/lib/routes";

export async function createMod(data: ModData) {
    try {
        // Validate required fields (basic validation)
        if (!data.slug || !data.title || !data.author) {
            throw new Error("Missing required fields");
        }

        // Check if mod with slug already exists
        const existingMod = await prisma.mod.findUnique({
            where: { slug: data.slug }
        });

        if (existingMod) {
            throw new Error(`Mod with slug '${data.slug}' already exists`);
        }

        // 1. Handle Author Tag
        let authorTag = await prisma.tag.findUnique({
            where: {
                category_value: {
                    category: 'author',
                    value: data.author.toLowerCase().replace(/\s+/g, '_')
                }
            }
        });

        if (!authorTag) {
            authorTag = await prisma.tag.create({
                data: {
                    category: 'author',
                    value: data.author.toLowerCase().replace(/\s+/g, '_'),
                    displayName: data.author
                }
            });
        }

        // 2. Prepare Tags (include author tag)
        const tagsToConnect = data.tags.map(tag => ({
            tag: {
                connectOrCreate: {
                    where: {
                        category_value: {
                            category: tag.category || 'tag',
                            value: tag.displayName.toLowerCase().replace(/\s+/g, '_')
                        }
                    },
                    create: {
                        category: tag.category || 'tag',
                        value: tag.displayName.toLowerCase().replace(/\s+/g, '_'),
                        displayName: tag.displayName,
                        color: tag.color
                    }
                }
            }
        }));

        // Add author tag
        tagsToConnect.push({
            tag: {
                connectOrCreate: {
                    where: {
                        category_value: {
                            category: 'author',
                            value: authorTag.value
                        }
                    },
                    create: {
                        category: 'author',
                        value: authorTag.value,
                        displayName: authorTag.displayName,
                        color: authorTag.color
                    }
                }
            }
        });

        // Create the mod
        await prisma.mod.create({
            data: {
                slug: data.slug,
                title: data.title,
                version: data.version,
                author: data.author,
                description: data.description,
                status: data.status,
                gameVersion: data.gameVersion,
                bannerUrl: data.bannerUrl || null,
                isSaveBreaking: data.isSaveBreaking,
                features: data.features,
                tags: {
                    create: tagsToConnect
                },
                installationSteps: data.installationSteps,
                links: data.links as any, // Cast to any for Json compatibility
                videos: data.videos as any,
                changelog: data.changelog as any,
                localizations: data.localizations as any,

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

        return { success: true, slug: data.slug };
    } catch (error) {
        console.error("Failed to create mod:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}
