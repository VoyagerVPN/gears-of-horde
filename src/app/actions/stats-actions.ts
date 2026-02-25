"use server"


import { db } from "@/lib/db"

export async function fetchAdminStats() {
    const [
        { count: userCount },
        { count: modCount },
        { count: newsCount },
        { count: pendingSubmissions },
        { count: downloadCount }
    ] = await Promise.all([
        db.from('User').select('*', { count: 'exact', head: true }),
        db.from('Mod').select('*', { count: 'exact', head: true }),
        db.from('News').select('*', { count: 'exact', head: true }),
        db.from('ModSubmission').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        db.from('DownloadHistory').select('*', { count: 'exact', head: true })
    ])

    return {
        userCount: userCount ?? 0,
        modCount: modCount ?? 0,
        newsCount: newsCount ?? 0,
        pendingSubmissions: pendingSubmissions ?? 0,
        downloadCount: downloadCount ?? 0
    }
}

interface ActivityStatsRow {
    stats_date: string;
    registrations: number | string;
    views: number | string;
}

export async function fetchActivityStats(days = 30) {
    // SECURITY: This is a read-only aggregation for admin dashboard
    // We use the RPC get_activity_stats to offload heavy processing to the DB
    const { data, error } = await db.rpc('get_activity_stats', {
        days_count: days
    }) as { data: ActivityStatsRow[] | null, error: unknown };

    if (error) {
        console.error('Error fetching activity stats:', error);
        return [];
    }

    // RPC returns: { stats_date: string, registrations: number, views: number }
    // Transform keys if necessary to match component expectations
    return (data || []).map((row: ActivityStatsRow) => ({
        date: row.stats_date,
        registrations: Number(row.registrations),
        views: Number(row.views)
    }));
}
