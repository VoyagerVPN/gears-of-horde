'use server';


import { NewsItem, FrozenTag } from "@/schemas/news.schema";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { NewsUpdate } from "@/schemas/news.schema";
import { db } from "@/lib/db";
import { sanitizeHtml, stripHtml } from "@/lib/sanitization";
import { DatabaseNewsWithFrozenData } from "@/types/database";

export async function fetchLatestNews(limit: number = 10, skip: number = 0, tag?: string): Promise<NewsItem[]> {
    let query = db
        .from('News')
        .select('*')
        .order('date', { ascending: false })
        .range(skip, skip + limit - 1);

    if (tag) {
        // Filter by tags stored in JSONB array
        // Supabase/Postgres equivalent of Prisma's array_contains
        query = query.contains('tags', JSON.stringify([{ displayName: tag }]));
    }

    const { data: newsItems, error } = await query;
    const news = newsItems as unknown as DatabaseNewsWithFrozenData[] | null;

    if (error) {
        console.error("Failed to fetch news:", error.message);
        return [];
    }

    return (news || []).map((item) => ({
        id: item.id,
        modSlug: item.modSlug || '',
        modName: item.modName || 'Unknown',
        modVersion: item.modVersion || undefined,
        gameVersion: item.gameVersion || undefined,
        actionText: item.actionText || 'released',
        content: item.content,
        description: item.description || undefined,
        date: typeof item.date === 'string' ? item.date : (item.date as Date).toISOString(),
        tags: (item.tags as FrozenTag[]) || [],
        wipeRequired: item.wipeRequired,
        sourceUrl: item.sourceUrl || ''
    }));
}

export async function fetchNewsTags(): Promise<FrozenTag[]> {
    // Query newscat tags from the Tag table as the single source of truth
    const { data: tags, error } = await db
        .from('Tag')
        .select('*')
        .eq('category', 'newscat')
        .order('displayName', { ascending: true });

    if (error) {
        console.error("Failed to fetch news tags:", error.message);
        return [];
    }

    return (tags || []).map((tag) => ({
        id: tag.id,
        displayName: tag.displayName,
        color: tag.color || undefined,
        category: tag.category
    }));
}

// ============================================================================
// ADMIN NEWS MANAGEMENT ACTIONS
// ============================================================================

/**
 * Fetch all news items for admin management (ordered by date desc)
 */
export async function fetchAllNews(limit: number = 50, skip: number = 0): Promise<NewsItem[]> {
    const { data: newsItems, error } = await db
        .from('News')
        .select('*')
        .order('date', { ascending: false })
        .range(skip, skip + limit - 1);
    
    const news = newsItems as unknown as DatabaseNewsWithFrozenData[] | null;

    if (error) {
        console.error("Failed to fetch all news:", error.message);
        return [];
    }

    return (news || []).map((item) => ({
        id: item.id,
        modSlug: item.modSlug || '',
        modName: item.modName || 'Unknown',
        modVersion: item.modVersion || undefined,
        gameVersion: item.gameVersion || undefined,
        actionText: item.actionText || 'released',
        content: item.content,
        description: item.description || undefined,
        date: typeof item.date === 'string' ? item.date : (item.date as Date).toISOString(),
        tags: (item.tags as FrozenTag[]) || [],
        wipeRequired: item.wipeRequired,
        sourceUrl: item.sourceUrl || ''
    }));
}

/**
 * Update a news item (admin only)
 */
export async function updateNews(id: string, data: NewsUpdate) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    // Check role using db client
    const { data: dbUser } = await db
        .from('User')
        .select('role')
        .eq('id', user?.id)
        .single();

    if (dbUser?.role !== 'ADMIN' && dbUser?.role !== 'MODERATOR') throw new Error("Unauthorized");

    try {
        const { error } = await db
            .from('News')
            .update({
                modName: data.modName ? stripHtml(data.modName) : undefined,
                modSlug: data.modSlug,
                modVersion: data.modVersion ? stripHtml(data.modVersion) : undefined,
                gameVersion: data.gameVersion,
                actionText: data.actionText,
                content: data.content ? sanitizeHtml(data.content) : undefined,
                description: data.description ? sanitizeHtml(data.description) : undefined,
                date: data.date,
                wipeRequired: data.wipeRequired,
                sourceUrl: data.sourceUrl,
                tags: data.tags
            })
            .eq('id', id);

        if (error) throw error;

        revalidatePath('/news');
        revalidatePath('/profile/news');
        return { success: true };
    } catch (error) {
        console.error("Failed to update news:", error);
        return { success: false, error: String(error) };
    }
}

/**
 * Delete a news item (admin only)
 */
export async function deleteNews(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    // Check role using db client
    const { data: dbUser } = await db
        .from('User')
        .select('role')
        .eq('id', user?.id)
        .single();

    if (dbUser?.role !== 'ADMIN' && dbUser?.role !== 'MODERATOR') throw new Error("Unauthorized");

    try {
        const { error } = await db
            .from('News')
            .delete()
            .eq('id', id);

        if (error) throw error;

        revalidatePath('/news');
        revalidatePath('/profile/news');
        return { success: true };
    } catch (error) {
        console.error("Failed to delete news:", error);
        return { success: false, error: String(error) };
    }
}

