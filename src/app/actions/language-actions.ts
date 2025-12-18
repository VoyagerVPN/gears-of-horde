'use server';

import { db as prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { ROUTES } from "@/lib/routes";

export interface LanguageData {
    id: string;
    name: string;       // e.g., "English", "Russian", "German"
    usageCount: number; // Number of mods using this language
}

/**
 * Fetch all languages from the database
 */
export async function fetchAllLanguages(): Promise<LanguageData[]> {
    const tags = await prisma.tag.findMany({
        where: { category: 'lang' },
        include: {
            _count: {
                select: { modTags: true }
            }
        },
        orderBy: { displayName: 'asc' }
    });

    return tags.map(tag => ({
        id: tag.id,
        name: tag.displayName,
        usageCount: tag._count.modTags
    }));
}

/**
 * Search languages by name or code
 */
export async function searchLanguages(query: string, limit: number = 10): Promise<LanguageData[]> {
    if (!query || query.length < 1) return [];

    const tags = await prisma.tag.findMany({
        where: {
            category: 'lang',
            OR: [
                { displayName: { contains: query, mode: 'insensitive' } },
                { value: { contains: query.toLowerCase(), mode: 'insensitive' } }
            ]
        },
        include: {
            _count: {
                select: { modTags: true }
            }
        },
        orderBy: {
            modTags: { _count: 'desc' }
        },
        take: limit
    });

    return tags.map(tag => ({
        id: tag.id,
        name: tag.displayName,
        usageCount: tag._count.modTags
    }));
}

/**
 * Create a new language in the database
 */
export async function createLanguage(name: string): Promise<LanguageData> {
    const normalizedValue = name.toLowerCase().trim().replace(/\s+/g, '_');

    // Check if language already exists
    const existing = await prisma.tag.findUnique({
        where: {
            category_value: {
                category: 'lang',
                value: normalizedValue
            }
        }
    });

    if (existing) {
        return {
            id: existing.id,
            name: existing.displayName,
            usageCount: 0
        };
    }

    // Create new language tag
    const tag = await prisma.tag.create({
        data: {
            category: 'lang',
            value: normalizedValue,
            displayName: name.trim(),
            color: null // Languages don't need colors
        }
    });

    revalidatePath(ROUTES.mods);

    return {
        id: tag.id,
        name: tag.displayName,
        usageCount: 0
    };
}

/**
 * Get or create a language by name
 */
export async function getOrCreateLanguage(name: string): Promise<LanguageData> {
    const normalizedValue = name.toLowerCase().trim().replace(/\s+/g, '_');

    const tag = await prisma.tag.upsert({
        where: {
            category_value: {
                category: 'lang',
                value: normalizedValue
            }
        },
        update: {}, // Don't update if exists
        create: {
            category: 'lang',
            value: normalizedValue,
            displayName: name.trim(),
            color: null
        },
        include: {
            _count: {
                select: { modTags: true }
            }
        }
    });

    return {
        id: tag.id,
        name: tag.displayName,
        usageCount: tag._count.modTags
    };
}
