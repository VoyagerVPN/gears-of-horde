'use server';

import { db as prisma } from "@/lib/db";
import { ModData } from "@/types/mod";
import { Prisma } from "@/generated/prisma";
import { PrismaModWithTags, mapPrismaModToModData } from "@/types/database";

interface SearchFilters {
    tag?: string;
    lang?: string;
    version?: string;
    status?: string;
}

export async function searchMods(query: string, filters: SearchFilters = {}): Promise<ModData[]> {
    const { tag, lang, version, status } = filters;

    const whereClause: Prisma.ModWhereInput = {
        AND: []
    };
    // Ensure AND is initialized as array (typescript knows because of above, but runtime safety)
    if (!whereClause.AND) whereClause.AND = [];
    const andFilters = whereClause.AND as Prisma.ModWhereInput[];

    // Text Search (Title or Description)
    if (query) {
        andFilters.push({
            OR: [
                { title: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } }
            ]
        });
    }

    // Tag Filter
    if (tag) {
        andFilters.push({
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
        andFilters.push({
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
        andFilters.push({
            gameVersion: version
        });
    }

    // Status Filter
    if (status) {
        andFilters.push({
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
    return mods.map((mod) => mapPrismaModToModData(mod as unknown as PrismaModWithTags));
}
