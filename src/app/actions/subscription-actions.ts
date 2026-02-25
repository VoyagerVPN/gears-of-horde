"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { 
    DatabaseSubscriptionWithMod, 
    mapDatabaseModToModData 
} from "@/types/database"

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

export async function getSubscriptions(sort: 'update' | 'subscribed' = 'update') {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    let query = supabase
        .from('Subscription')
        .select(`
            *,
            mod:Mod (${MOD_WITH_TAGS_SELECT})
        `)
        .eq('userId', user.id);

    if (sort === 'update') {
        query = query.order('mod(updatedAt)', { ascending: false });
    } else {
        query = query.order('subscribedAt', { ascending: false });
    }

    const { data: subscriptions } = await query;

    return (subscriptions || []).map((sub) => {
        const s = sub as unknown as DatabaseSubscriptionWithMod;
        return {
            ...s,
            mod: mapDatabaseModToModData(s.mod)
        };
    });
}

export async function toggleSubscription(modSlug: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { data: existing } = await supabase
        .from('Subscription')
        .select('id')
        .eq('userId', user.id)
        .eq('modSlug', modSlug)
        .maybeSingle();

    if (existing) {
        await supabase.from('Subscription').delete().eq('id', existing.id);
        revalidatePath(`/${modSlug}`)
        return { subscribed: false }
    } else {
        await supabase.from('Subscription').insert({
            userId: user.id,
            modSlug
        });
        revalidatePath(`/${modSlug}`)
        return { subscribed: true }
    }
}

export async function getSubscriptionStatus(modSlug: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { subscribed: false }

    const { data: sub } = await supabase
        .from('Subscription')
        .select('id')
        .eq('userId', user.id)
        .eq('modSlug', modSlug)
        .maybeSingle();

    return { subscribed: !!sub }
}

export async function markSubscriptionViewed(modSlug: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
        .from('Subscription')
        .update({
            lastViewedAt: new Date().toISOString(),
            unseenVersions: 0
        })
        .eq('userId', user.id)
        .eq('modSlug', modSlug);
}
