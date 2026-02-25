'use server';


import { revalidatePath } from "next/cache";
import { ROUTES } from "@/lib/routes";
import { db } from "@/lib/db";
import { type TagData } from "@/schemas";
import {
    TagCreateSchema,
    TagUpdateSchema,
    TagMergeSchema,
} from "@/schemas";
import { validate, ok, err, type Result } from "@/lib/result";
import { DatabaseTagWithCount, mapDatabaseTagWithCountToTagData } from "@/types/database";
import { recalculateGameVersionColors as recalculateColors } from "@/lib/tags";

// Re-export TagData for backwards compatibility
export type { TagData } from "@/schemas";

const TAG_SELECT_WITH_COUNT = `
    *,
    modTags:ModTag(count)
`;

export async function fetchNavCategories(): Promise<TagData[]> {
    const { data: tags, error } = await db
        .from('Tag')
        .select(TAG_SELECT_WITH_COUNT)
        .eq('category', 'tag')
        .order('displayName', { ascending: true });

    if (error) {
        console.error("Failed to fetch nav categories:", error.message);
        return [];
    }

    return (tags as unknown as DatabaseTagWithCount[]).map(mapDatabaseTagWithCountToTagData);
}

export async function fetchAllTags(): Promise<TagData[]> {
    const { data: tags, error } = await db
        .from('Tag')
        .select(TAG_SELECT_WITH_COUNT)
        .order('category', { ascending: true });

    if (error) {
        console.error("Failed to fetch all tags:", error.message);
        return [];
    }

    return (tags as unknown as DatabaseTagWithCount[]).map(mapDatabaseTagWithCountToTagData);
}

export async function fetchTagsByCategory(category: string): Promise<TagData[]> {
    const { data: tags, error } = await db
        .from('Tag')
        .select(TAG_SELECT_WITH_COUNT)
        .eq('category', category)
        .order('displayName', { ascending: true });

    if (error) {
        console.error(`Failed to fetch tags for category ${category}:`, error.message);
        return [];
    }

    return (tags as unknown as DatabaseTagWithCount[]).map(mapDatabaseTagWithCountToTagData);
}

export async function fetchPopularTags(limit: number = 10, category?: string): Promise<TagData[]> {
    let query = db
        .from('Tag')
        .select(TAG_SELECT_WITH_COUNT);

    if (category) {
        query = query.eq('category', category);
    } else {
        query = query.not('category', 'in', '("gamever", "author", "status", "lang", "newscat")');
    }

    // Note: PostgREST doesn't support ordering by aggregate count of related table in a simple way
    // We'll fetch and sort in-memory for "popular" tags if limit is small, or just fetch all and take popular
    // For large datasets, a view or RPC would be better.
    const { data: tags, error } = await query;

    if (error) {
        console.error("Failed to fetch popular tags:", error.message);
        return [];
    }

    return (tags as unknown as DatabaseTagWithCount[])
        .map(mapDatabaseTagWithCountToTagData)
        .sort((a, b) => (b.usageCount ?? 0) - (a.usageCount ?? 0))
        .slice(0, limit);
}

export async function searchTags(query: string, category: string = 'tag', limit: number = 10): Promise<TagData[]> {
    if (!query || query.length < 1) return [];

    const { data: tags, error } = await db
        .from('Tag')
        .select(TAG_SELECT_WITH_COUNT)
        .eq('category', category)
        .ilike('displayName', `%${query}%`)
        .order('displayName', { ascending: true })
        .limit(limit);

    if (error) {
        console.error("Failed to search tags:", error.message);
        return [];
    }

    return (tags as unknown as DatabaseTagWithCount[]).map(mapDatabaseTagWithCountToTagData);
}

export async function createTag(rawData: unknown): Promise<Result<{ id: string }>> {
    const validated = validate(TagCreateSchema, rawData);
    if (!validated.success) return validated;
    const data = validated.data;

    const { getTagColor } = await import('@/lib/tag-colors');
    const color = data.color || (data.category === 'gamever' ? undefined : getTagColor(data.category, data.value));

    try {
        const { data: tag, error } = await db
            .from('Tag')
            .insert({
                category: data.category,
                value: data.value,
                displayName: data.displayName,
                color: color
            })
            .select()
            .single();

        if (error) throw error;

        if (data.category === 'gamever') {
            await recalculateColors();
        }

        revalidatePath(ROUTES.tags);
        return ok({ id: tag.id });
    } catch (error) {
        console.error("Failed to create tag:", error);
        return err("Failed to create tag");
    }
}

export async function updateTag(id: string, rawData: unknown): Promise<Result<{ id: string }>> {
    const validated = validate(TagUpdateSchema, rawData);
    if (!validated.success) return validated;
    const data = validated.data;

    if (!id || id.trim() === '') return err("Tag ID is required");

    try {
        const { data: existing, error: _fetchError } = await db
            .from('Tag')
            .select('category')
            .eq('id', id)
            .single();

        if (_fetchError || !existing) return err("Tag not found");

        const { data: tag, error: updateError } = await db
            .from('Tag')
            .update(data)
            .eq('id', id)
            .select()
            .single();

        if (updateError) throw updateError;

        if (existing.category === 'gamever' || tag.category === 'gamever') {
            await recalculateColors();
        }

        revalidatePath(ROUTES.tags);
        return ok({ id: tag.id });
    } catch (error) {
        console.error("Failed to update tag:", error);
        return err("Failed to update tag");
    }
}

export async function deleteTag(id: string): Promise<Result<{ deleted: true }>> {
    if (!id || id.trim() === '') return err("Tag ID is required");

    try {
        const { data: tag, error: fetchError } = await db
            .from('Tag')
            .select('category')
            .eq('id', id)
            .single();

        if (fetchError || !tag) return err("Tag not found");

        const { error: deleteError } = await db
            .from('Tag')
            .delete()
            .eq('id', id);

        if (deleteError) throw deleteError;

        if (tag.category === 'gamever') {
            await recalculateColors();
        }

        revalidatePath(ROUTES.tags);
        return ok({ deleted: true });
    } catch (error) {
        console.error("Failed to delete tag:", error);
        return err("Failed to delete tag");
    }
}

export async function mergeTags(rawData: unknown): Promise<Result<{ merged: true }>> {
    const validated = validate(TagMergeSchema, rawData);
    if (!validated.success) return validated;
    const { sourceId, targetId } = validated.data;

    try {
        // Since Supabase client doesn't support transactions in JS easily, 
        // we'll do these steps and handle errors. For full consistency, an RPC is recommended.
        
        // 1. Fetch info
        const { data: sourceTag } = await db.from('Tag').select('*').eq('id', sourceId).single();
        const { data: targetTag } = await db.from('Tag').select('*').eq('id', targetId).single();

        if (!sourceTag || !targetTag) throw new Error("Source or target tag not found");

        // 2. Transer ModTags
        const { data: modTags } = await db.from('ModTag').select('*').eq('tagId', sourceId);
        if (modTags && modTags.length > 0) {
            const modIds = modTags.map((mt: { modId: string }) => mt.modId);

            // Update string fields
            if (sourceTag.category === 'gamever' && targetTag.category === 'gamever') {
                await db.from('Mod').update({ gameVersion: targetTag.displayName }).in('slug', modIds);
            } else if (sourceTag.category === 'author' && targetTag.category === 'author') {
                await db.from('Mod').update({ author: targetTag.displayName }).in('slug', modIds);
            } else if (sourceTag.category === 'status' && targetTag.category === 'status') {
                await db.from('Mod').update({ status: targetTag.value }).in('slug', modIds);
            }

            // Transfer relation
            for (const smt of modTags) {
                // Upsert into target
                await db.from('ModTag').upsert({
                    modId: smt.modId,
                    tagId: targetId,
                    isExternal: smt.isExternal,
                    externalLink: smt.externalLink
                }, { onConflict: 'modId,tagId' });
            }
        }

        // 3. Update News references
        if (sourceTag.category === 'gamever') {
            await db.from('News').update({ gameVersionTagId: targetId }).eq('gameVersionTagId', sourceId);
        } else if (sourceTag.category === 'newscat') {
            await db.from('News').update({ newscatTagId: targetId }).eq('newscatTagId', sourceId);
        }

        // 4. Delete source
        await db.from('Tag').delete().eq('id', sourceId);

        if (sourceTag.category === 'gamever' || targetTag.category === 'gamever') {
            await recalculateColors();
        }

        revalidatePath(ROUTES.tags);
        return ok({ merged: true });
    } catch (error) {
        console.error("Failed to merge tags:", error);
        return err(error instanceof Error ? error.message : "Failed to merge tags");
    }
}

export async function recalculateGameVersionColors() {
    await recalculateColors();
}

export async function renameCategory(oldCategory: string, newCategory: string) {
    const { data: targetTags } = await db.from('Tag').select('id, value').eq('category', newCategory);
    const { data: sourceTags } = await db.from('Tag').select('*').eq('category', oldCategory);

    if (!sourceTags) return;

    if (!targetTags || targetTags.length === 0) {
        // Simple rename
        await db.from('Tag').update({ category: newCategory }).eq('category', oldCategory);
    } else {
        // Merge logic
        for (const sourceTag of sourceTags) {
            const targetTag = targetTags.find((t: { value: string; id: string }) => t.value === sourceTag.value);
            if (targetTag) {
                await mergeTags({ sourceId: sourceTag.id, targetId: targetTag.id });
            } else {
                await db.from('Tag').update({ category: newCategory }).eq('id', sourceTag.id);
            }
        }
    }

    if (oldCategory === 'gamever' || newCategory === 'gamever') {
        await recalculateColors();
    }

    revalidatePath(ROUTES.tags);
}

export async function deleteCategory(category: string) {
    await db.from('Tag').delete().eq('category', category);

    if (category === 'gamever') {
        await recalculateColors();
    }

    revalidatePath(ROUTES.tags);
}
