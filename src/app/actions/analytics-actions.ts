"use server"

import { db } from "@/lib/db"
import { createClient } from "@/utils/supabase/server"
import { headers } from "next/headers"
import { createHash } from "crypto"
import { 
    DatabaseViewHistoryWithMod, 
    DatabaseDownloadHistoryWithMod, 
    mapDatabaseModToModData 
} from "@/types/database"
import { markSubscriptionViewed } from "./subscription-actions"

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

const DOWNLOAD_COOLDOWN_HOURS = 24
const VIEW_COOLDOWN_HOURS = 24
const VIEW_HISTORY_LIMIT = 50

async function getHashedClientIP(): Promise<string> {
    const headersList = await headers()
    const forwardedFor = headersList.get('x-forwarded-for')
    const realIp = headersList.get('x-real-ip')
    const cfConnectingIp = headersList.get('cf-connecting-ip')

    const ip = forwardedFor?.split(',')[0]?.trim() || realIp || cfConnectingIp || 'unknown'

    return createHash('sha256').update(ip).digest('hex').substring(0, 32)
}

async function incrementModDownloads(modSlug: string) {
    const { data: mod } = await db
        .from('Mod')
        .select('downloads')
        .eq('slug', modSlug)
        .maybeSingle();

    if (mod) {
        const currentCount = parseInt(mod.downloads) || 0
        await db
            .from('Mod')
            .update({ downloads: (currentCount + 1).toString() })
            .eq('slug', modSlug);
    }
}

async function incrementModViews(modSlug: string) {
    const { data: mod } = await db
        .from('Mod')
        .select('views')
        .eq('slug', modSlug)
        .maybeSingle();

    if (mod) {
        const currentCount = parseInt(mod.views) || 0
        await db
            .from('Mod')
            .update({ views: (currentCount + 1).toString() })
            .eq('slug', modSlug);
    }
}

export async function getDownloadHistory(page: number = 1, pageSize: number = 20) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) return { downloads: [], hasMore: false }

    const { data: downloads } = await supabase
        .from('DownloadHistory')
        .select(`
            *,
            mod:Mod (${MOD_WITH_TAGS_SELECT})
        `)
        .eq('userId', user.id)
        .order('downloadedAt', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize);

    const items = (downloads || []).slice(0, pageSize)
    const hasMore = (downloads || []).length > pageSize

    return {
        downloads: items.map((dl: any) => {
            const d = dl as unknown as DatabaseDownloadHistoryWithMod;
            return {
                ...d,
                mod: mapDatabaseModToModData(d.mod)
            };
        }),
        hasMore
    }
}

export async function recordDownload(modSlug: string, version: string, sessionId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) {
        return recordAnonymousDownload(modSlug)
    }

    const cooldownDate = new Date()
    cooldownDate.setHours(cooldownDate.getHours() - DOWNLOAD_COOLDOWN_HOURS)

    const { data: existingDownload } = await supabase
        .from('DownloadHistory')
        .select('id')
        .eq('userId', user.id)
        .eq('modSlug', modSlug)
        .gte('downloadedAt', cooldownDate.toISOString())
        .maybeSingle();

    const shouldIncrementDownloads = !existingDownload

    try {
        await supabase.from('DownloadHistory').insert({
            userId: user.id,
            modSlug,
            version,
            sessionId
        });
    } catch {
        // Skip on error
    }

    if (shouldIncrementDownloads) {
        await incrementModDownloads(modSlug)
    }

    return { recorded: true, incremented: shouldIncrementDownloads }
}

export async function getViewHistory() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) return []

    const { data: history } = await supabase
        .from('ViewHistory')
        .select(`
            *,
            mod:Mod (${MOD_WITH_TAGS_SELECT})
        `)
        .eq('userId', user.id)
        .order('viewedAt', { ascending: false })
        .limit(VIEW_HISTORY_LIMIT);

    return (history || []).map((vh: any) => {
        const v = vh as unknown as DatabaseViewHistoryWithMod;
        return {
            ...v,
            mod: mapDatabaseModToModData(v.mod)
        };
    });
}

export async function recordView(modSlug: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) return { recorded: false }

    const cooldownDate = new Date()
    cooldownDate.setHours(cooldownDate.getHours() - VIEW_COOLDOWN_HOURS)

    const { data: existingView } = await supabase
        .from('ViewHistory')
        .select('viewedAt')
        .eq('userId', user.id)
        .eq('modSlug', modSlug)
        .maybeSingle();

    const shouldIncrementViews = !existingView || new Date(existingView.viewedAt) < cooldownDate

    await supabase.from('ViewHistory').upsert({
        userId: user.id,
        modSlug,
        viewedAt: new Date().toISOString()
    }, { onConflict: 'userId,modSlug' });

    if (shouldIncrementViews) {
        await incrementModViews(modSlug)
    }

    const { data: allViews } = await supabase
        .from('ViewHistory')
        .select('id')
        .eq('userId', user.id)
        .order('viewedAt', { ascending: false })
        .range(VIEW_HISTORY_LIMIT, VIEW_HISTORY_LIMIT + 100);

    if (allViews && allViews.length > 0) {
        await supabase.from('ViewHistory').delete().in('id', allViews.map(v => v.id));
    }

    await markSubscriptionViewed(modSlug)

    return { recorded: true, incremented: shouldIncrementViews }
}

export async function recordAnonymousView(modSlug: string) {
    if (!modSlug) return { recorded: false }

    const ipHash = await getHashedClientIP()
    const cooldownDate = new Date()
    cooldownDate.setHours(cooldownDate.getHours() - VIEW_COOLDOWN_HOURS)

    try {
        const { data: existingView } = await db
            .from('AnonymousView')
            .select('viewedAt')
            .eq('modSlug', modSlug)
            .eq('ipAddress', ipHash)
            .maybeSingle();

        const shouldIncrementViews = !existingView || new Date(existingView.viewedAt) < cooldownDate

        await db.from('AnonymousView').upsert({
            modSlug,
            ipAddress: ipHash,
            viewedAt: new Date().toISOString()
        }, { onConflict: 'modSlug,ipAddress' });

        if (shouldIncrementViews) {
            await incrementModViews(modSlug)
        }

        return { recorded: true, incremented: shouldIncrementViews }
    } catch {
        return { recorded: false, incremented: false }
    }
}

export async function recordAnonymousDownload(modSlug: string) {
    if (!modSlug) return { recorded: false }

    const ipHash = await getHashedClientIP()
    const cooldownDate = new Date()
    cooldownDate.setHours(cooldownDate.getHours() - DOWNLOAD_COOLDOWN_HOURS)

    try {
        const { data: existingDownload } = await db
            .from('AnonymousDownload')
            .select('downloadedAt')
            .eq('modSlug', modSlug)
            .eq('ipAddress', ipHash)
            .maybeSingle();

        const shouldIncrementDownloads = !existingDownload || new Date(existingDownload.downloadedAt) < cooldownDate

        await db.from('AnonymousDownload').upsert({
            modSlug,
            ipAddress: ipHash,
            downloadedAt: new Date().toISOString()
        }, { onConflict: 'modSlug,ipAddress' });

        if (shouldIncrementDownloads) {
            await incrementModDownloads(modSlug)
        }

        return { recorded: true, incremented: shouldIncrementDownloads }
    } catch {
        return { recorded: false, incremented: false }
    }
}

export async function cleanupOldAnonymousData() {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { count: deletedViews } = await db
        .from('AnonymousView')
        .delete({ count: 'exact' })
        .lt('viewedAt', thirtyDaysAgo.toISOString());

    const { count: deletedDownloads } = await db
        .from('AnonymousDownload')
        .delete({ count: 'exact' })
        .lt('downloadedAt', thirtyDaysAgo.toISOString());

    return {
        deletedViews: deletedViews || 0,
        deletedDownloads: deletedDownloads || 0
    }
}
