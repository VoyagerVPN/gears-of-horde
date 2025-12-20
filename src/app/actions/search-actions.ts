'use server';

import { db as prisma } from "@/lib/db";
import { ModData, ModStatusType } from "@/types/mod";
import { PrismaModWithTags, mapPrismaModToModData } from "@/types/database";

interface SearchFilters {
    tag?: string;
    lang?: string;
    version?: string;
    status?: string;
}

export async function searchMods(query: string, filters: SearchFilters = {}): Promise<ModData[]> {
    const { tag, lang, version, status } = filters;

    const whereClause: any = {
        AND: []
    };

    // Text Search (Title or Description)
    if (query) {
        whereClause.AND.push({
            OR: [
                { title: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } }
            ]
        });
    }

    // Tag Filter
    if (tag) {
        whereClause.AND.push({
            tags: {
                some: {
                    tag: {
                        displayName: { equals: tag, mode: 'insensitive' }
                    }
                }
            }
        });
    }

    // Language Filter
    if (lang) {
        whereClause.AND.push({
            tags: {
                some: {
                    tag: {
                        category: 'lang',
                        value: { equals: lang, mode: 'insensitive' }
                    }
                }
            }
        });
    }

    // Game Version Filter
    if (version) {
        whereClause.AND.push({
            gameVersion: version
        });
    }

    // Status Filter
    if (status) {
        whereClause.AND.push({
            status: status
        });
    }

    const mods = await prisma.mod.findMany({
        where: whereClause,
        orderBy: { updatedAt: 'desc' },
        include: {
            tags: {
                include: {
                    tag: true
                }
            }
        }
    });

    // Map to ModData
    return mods.map((mod: PrismaModWithTags) => mapPrismaModToModData(mod));
}
