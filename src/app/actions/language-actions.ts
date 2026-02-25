'use server';


import { revalidatePath } from "next/cache";
import { ROUTES } from "@/lib/routes";
import { db } from "@/lib/db";
import { DatabaseTagWithCount, mapDatabaseTagWithCountToTagData } from "@/types/database";

export interface LanguageData {
    id: string;
    name: string;       // e.g., "English", "Russian", "German"
    usageCount: number; // Number of mods using this language
}

const LANG_SELECT = `
    *,
    modTags:ModTag(count)
`;

/**
 * Fetch all languages from the database
 */
export async function fetchAllLanguages(): Promise<LanguageData[]> {
    const { data: tags, error } = await db
        .from('Tag')
        .select(LANG_SELECT)
        .eq('category', 'lang')
        .order('displayName', { ascending: true });

    if (error) {
        console.error("Failed to fetch all languages:", error.message);
        return [];
    }

    return (tags as unknown as DatabaseTagWithCount[]).map(tag => {
        const mapped = mapDatabaseTagWithCountToTagData(tag);
        return {
            id: mapped.id || '',
            name: mapped.displayName,
            usageCount: mapped.usageCount ?? 0
        };
    });
}

/**
 * Search languages by name or code
 */
export async function searchLanguages(query: string, limit: number = 10): Promise<LanguageData[]> {
    if (!query || query.length < 1) return [];

    const { data: tags, error } = await db
        .from('Tag')
        .select(LANG_SELECT)
        .eq('category', 'lang')
        .or(`displayName.ilike.%${query}%,value.ilike.%${query}%`)
        .limit(limit);

    if (error) {
        console.error("Failed to search languages:", error.message);
        return [];
    }

    // Sort by popularity in-memory if needed, or just return. Original code sorted by count desc.
    return (tags as unknown as DatabaseTagWithCount[])
        .map(tag => {
            const mapped = mapDatabaseTagWithCountToTagData(tag);
            return {
                id: mapped.id || '',
                name: mapped.displayName,
                usageCount: mapped.usageCount ?? 0
            };
        })
        .sort((a, b) => (b.usageCount ?? 0) - (a.usageCount ?? 0));
}

/**
 * Create a new language in the database
 */
export async function createLanguage(name: string): Promise<LanguageData> {
    const normalizedValue = name.toLowerCase().trim().replace(/\s+/g, '_');

    // Check if language already exists
    const { data: existing } = await db
        .from('Tag')
        .select('id, displayName')
        .eq('category', 'lang')
        .eq('value', normalizedValue)
        .maybeSingle();

    if (existing) {
        return {
            id: existing.id,
            name: existing.displayName,
            usageCount: 0
        };
    }

    // Create new language tag
    const { data: tag, error: insertError } = await db
        .from('Tag')
        .insert({
            category: 'lang',
            value: normalizedValue,
            displayName: name.trim(),
            color: null
        })
        .select()
        .single();

    if (insertError) {
        console.error("Failed to create language:", insertError.message);
        throw new Error("Failed to create language");
    }

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

    // Supabase upsert requires unique constraint. 
    // Since we have a composite unique constraint on (category, value), we can use it.
    const { data: tag, error } = await db
        .from('Tag')
        .upsert({
            category: 'lang',
            value: normalizedValue,
            displayName: name.trim(),
            color: null
        }, { onConflict: 'category,value' })
        .select(LANG_SELECT)
        .single();

    if (error) {
        console.error("Failed to get/create language:", error.message);
        throw new Error("Failed to get or create language");
    }

    const mapped = mapDatabaseTagWithCountToTagData(tag as unknown as DatabaseTagWithCount);
    return {
        id: mapped.id || '',
        name: mapped.displayName,
        usageCount: mapped.usageCount ?? 0
    };
}
