"use server"

import { db } from "@/lib/db"
import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { UserBioUpdateSchema } from "@/schemas"
import { validate, ok, err, type Result } from "@/lib/result"

// --- SUBSCRIPTIONS, ANALYTICS and AUTHOR actions moved to separate files ---

// ============ PUBLIC PROFILE ============


export async function getUserProfileStats() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) return null

    const { data: dbUser } = await supabase
        .from('User')
        .select(`
            id,
            name,
            image,
            bio,
            role,
            isProfilePublic,
            profileViews,
            createdAt,
            socialLinks:UserSocialLink (
                id,
                platform,
                url
            ),
            badges:UserBadge (
                earnedAt,
                badge:Badge (*)
            )
        `)
        .eq('id', user.id)
        .single();
    
    if (!dbUser) return null

    const { data: userMods } = await supabase
        .from('Mod')
        .select('downloads')
        .eq('authorId', user.id);

    const modsCount = (userMods || []).length
    const totalDownloads = (userMods || []).reduce((acc, mod) => {
        return acc + (parseInt(mod.downloads) || 0)
    }, 0)

    const commentsCount = 0
    const commentLikes = 0

    return {
        id: dbUser.id,
        name: dbUser.name,
        image: dbUser.image,
        bio: dbUser.bio,
        role: dbUser.role,
        isProfilePublic: dbUser.isProfilePublic,
        profileViews: dbUser.profileViews,
        createdAt: typeof dbUser.createdAt === 'string' ? dbUser.createdAt : dbUser.createdAt.toISOString(),
        socialLinks: (dbUser.socialLinks as unknown as { id: string; platform: string; url: string }[] || []).map((sl) => ({
            id: sl.id,
            platform: sl.platform,
            url: sl.url
        })),
        badges: (dbUser.badges as unknown as { earnedAt: string | Date; badge: { id: string; slug: string; name: string; icon: string; description: string; rarity: string } }[] || []).map((ub) => ({
            id: ub.badge.id,
            slug: ub.badge.slug,
            name: ub.badge.name,
            icon: ub.badge.icon,
            description: ub.badge.description,
            rarity: ub.badge.rarity,
            earnedAt: typeof ub.earnedAt === 'string' ? ub.earnedAt : (ub.earnedAt as Date).toISOString()
        })).sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime()),
        stats: {
            totalDownloads,
            modsCount,
            commentsCount,
            commentLikes
        }
    }
}

export async function updateUserBio(rawData: unknown): Promise<Result<{ bio: string }>> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) {
        return err("Not authenticated")
    }

    const validated = validate(UserBioUpdateSchema, rawData)
    if (!validated.success) {
        return validated
    }

    try {
        await supabase
            .from('User')
            .update({ bio: validated.data.bio })
            .eq('id', user.id);

        revalidatePath('/profile')

        return ok({ bio: validated.data.bio })
    } catch (error) {
        console.error("Failed to update bio:", error)
        return err("Failed to update bio")
    }
}

// ============ SOCIAL LINKS ============

const SUPPORTED_PLATFORMS = ['discord', 'steam', 'youtube', 'twitch', 'github', 'boosty'] as const
type Platform = typeof SUPPORTED_PLATFORMS[number]

interface SocialLinkInput {
    platform: string
    url: string
}

export async function updateSocialLinks(links: SocialLinkInput[]): Promise<Result<{ count: number }>> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) {
        return err("Not authenticated")
    }

    const validLinks = links.filter(link =>
        SUPPORTED_PLATFORMS.includes(link.platform as Platform) &&
        link.url.trim().length > 0
    )

    try {
        // Delete existing links
        await supabase.from('UserSocialLink').delete().eq('userId', user.id);

        // Create new links
        if (validLinks.length > 0) {
            await supabase.from('UserSocialLink').insert(
                validLinks.map(link => ({
                    userId: user.id,
                    platform: link.platform,
                    url: link.url.trim()
                }))
            );
        }

        revalidatePath('/profile')
        return ok({ count: validLinks.length })
    } catch (error) {
        console.error("Failed to update social links:", error)
        return err("Failed to update social links")
    }
}

export async function deleteSocialLink(platform: string): Promise<Result<{ deleted: boolean }>> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) {
        return err("Not authenticated")
    }

    try {
        await supabase.from('UserSocialLink').delete().eq('userId', user.id).eq('platform', platform);
        revalidatePath('/profile')
        return ok({ deleted: true })
    } catch (error) {
        console.error("Failed to delete social link:", error)
        return err("Failed to delete social link")
    }
}

// ============ PROFILE VISIBILITY ============

export async function toggleProfileVisibility(): Promise<Result<{ isPublic: boolean }>> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) {
        return err("Not authenticated")
    }

    try {
        const { data: dbUser } = await supabase
            .from('User')
            .select('isProfilePublic')
            .eq('id', user.id)
            .single();

        if (!dbUser) {
            return err("User not found")
        }

        const newVisibility = !dbUser.isProfilePublic

        await supabase.from('User').update({ isProfilePublic: newVisibility }).eq('id', user.id);

        revalidatePath('/profile')
        return ok({ isPublic: newVisibility })
    } catch (error) {
        console.error("Failed to toggle profile visibility:", error)
        return err("Failed to update visibility")
    }
}

// ============ PROFILE VIEW TRACKING ============

const PROFILE_VIEW_COOLDOWN_HOURS = 24

export async function recordProfileView(viewedUserId: string): Promise<{ recorded: boolean }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const viewerId = user?.id || null

    if (viewerId === viewedUserId) {
        return { recorded: false }
    }

    const cooldownDate = new Date()
    cooldownDate.setHours(cooldownDate.getHours() - PROFILE_VIEW_COOLDOWN_HOURS)

    try {
        let existingView = null;
        if (viewerId) {
            const { data } = await db
                .from('ProfileView')
                .select('viewedAt')
                .eq('viewerId', viewerId)
                .eq('viewedId', viewedUserId)
                .gte('viewedAt', cooldownDate.toISOString())
                .maybeSingle();
            existingView = data;
        }

        const shouldRecord = !existingView

        if (shouldRecord) {
            await db.from('ProfileView').insert({
                viewerId,
                viewedId: viewedUserId
            });

            const { data: mod } = await db.from('User').select('profileViews').eq('id', viewedUserId).single();
            if (mod) {
                await db.from('User').update({ profileViews: (mod.profileViews || 0) + 1 }).eq('id', viewedUserId);
            }
        }

        return { recorded: shouldRecord }
    } catch (error) {
        console.error("Failed to record profile view:", error)
        return { recorded: false }
    }
}

// ============ RECENT ACTIVITY ============

interface ActivityItem {
    type: 'mod_published' | 'mod_updated' | 'badge_earned'
    title: string
    slug?: string
    timestamp: string
}

export async function getRecentActivity(): Promise<ActivityItem[]> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) return []

    const activities: ActivityItem[] = []

    const { data: recentMods } = await supabase
        .from('Mod')
        .select('slug, title, createdAt, updatedAt')
        .eq('authorId', user.id)
        .order('updatedAt', { ascending: false })
        .limit(5);

    for (const mod of (recentMods || [])) {
        const createDate = new Date(mod.createdAt).getTime();
        const updateDate = new Date(mod.updatedAt).getTime();
        const isNew = Math.abs(createDate - updateDate) < 60000

        activities.push({
            type: isNew ? 'mod_published' : 'mod_updated',
            title: mod.title,
            slug: mod.slug,
            timestamp: typeof mod.updatedAt === 'string' ? mod.updatedAt : mod.updatedAt.toISOString()
        })
    }

    const { data: recentBadges } = await supabase
        .from('UserBadge')
        .select('earnedAt, badge:Badge (name)')
        .eq('userId', user.id)
        .order('earnedAt', { ascending: false })
        .limit(3);
    
    for (const ub of (recentBadges as unknown as { earnedAt: string | Date; badge: { name: string } }[] || [])) {
        activities.push({
            type: 'badge_earned',
            title: ub.badge.name,
            timestamp: typeof ub.earnedAt === 'string' ? ub.earnedAt : (ub.earnedAt as Date).toISOString()
        })
    }

    return activities
        .sort((a: ActivityItem, b: ActivityItem) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10)
}
