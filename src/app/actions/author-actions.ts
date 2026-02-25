"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { 
    DatabaseModWithTags, 
    mapDatabaseModToModData 
} from "@/types/database"
import { ModData } from "@/schemas"

const MOD_WITH_TAGS_SELECT = `
    *,
    tags:ModTag (
        isExternal,
        externalLink,
        tag:Tag (
            id,
            category,
            value,
            displayName,
            color
        )
    )
`;

export async function getUserMods(): Promise<ModData[]> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) return []

    const { data: dbUser } = await supabase
        .from('User')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!dbUser || !['DEVELOPER', 'MODERATOR', 'ADMIN'].includes(dbUser.role)) {
        return []
    }

    const { data: mods } = await supabase
        .from('Mod')
        .select(MOD_WITH_TAGS_SELECT)
        .eq('authorId', user.id)
        .order('updatedAt', { ascending: false });

    return (mods || []).map((mod) => mapDatabaseModToModData(mod as unknown as DatabaseModWithTags))
}

export async function toggleModVisibility(slug: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) throw new Error("Not authenticated")

    const { data: dbUser } = await supabase
        .from('User')
        .select('role')
        .eq('id', user.id)
        .single();

    const { data: mod } = await supabase.from('Mod').select('status, authorId').eq('slug', slug).maybeSingle();
    if (!mod) throw new Error("Mod not found")

    if (mod.authorId !== user.id && (!dbUser || !['ADMIN', 'MODERATOR'].includes(dbUser.role))) {
        throw new Error("Not authorized")
    }

    const newStatus = mod.status === 'published' ? 'hidden' : 'published'

    await supabase.from('Mod').update({ status: newStatus }).eq('slug', slug);

    revalidatePath('/profile/my-mods')
    revalidatePath(`/${slug}`)

    return { status: newStatus }
}

export async function deleteUserMod(slug: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) throw new Error("Not authenticated")

    const { data: dbUser } = await supabase
        .from('User')
        .select('role')
        .eq('id', user.id)
        .single();

    const { data: mod } = await supabase.from('Mod').select('authorId').eq('slug', slug).maybeSingle();
    if (!mod) throw new Error("Mod not found")

    if (mod.authorId !== user.id && (!dbUser || !['ADMIN', 'MODERATOR'].includes(dbUser.role))) {
        throw new Error("Not authorized")
    }

    await supabase.from('Mod').delete().eq('slug', slug);

    revalidatePath('/profile/my-mods')

    return { success: true }
}
