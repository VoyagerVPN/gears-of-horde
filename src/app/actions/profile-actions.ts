"use server"

import { db } from "@/lib/db"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { UserBioUpdateSchema } from "@/schemas"
import { validate, ok, err, type Result } from "@/lib/result"
import {
    PrismaSubscriptionWithMod,
    PrismaViewHistoryWithMod,
    PrismaDownloadHistoryWithMod,
    PrismaModWithTags,
    mapPrismaTagToTagData
} from "@/types/database"

// ============ SUBSCRIPTIONS ============

export async function getSubscriptions(sort: 'update' | 'subscribed' = 'update') {
    const session = await auth()
    if (!session?.user?.id) return []

    const subscriptions = await db.subscription.findMany({
        where: { userId: session.user.id },
        include: {
            mod: {
                include: {
                    tags: {
                        include: { tag: true }
                    }
                }
            }
        },
        orderBy: sort === 'update'
            ? { mod: { updatedAt: 'desc' } }
            : { subscribedAt: 'desc' }
    })

    return subscriptions.map((sub: PrismaSubscriptionWithMod) => ({
        ...sub,
        mod: {
            ...sub.mod,
            tags: sub.mod.tags.map(mapPrismaTagToTagData)
        }
    }))
}

export async function toggleSubscription(modSlug: string) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Not authenticated")

    const existing = await db.subscription.findUnique({
        where: {
            userId_modSlug: {
                userId: session.user.id,
                modSlug
            }
        }
    })

    if (existing) {
        await db.subscription.delete({
            where: { id: existing.id }
        })
        revalidatePath(`/mod/${modSlug}`)
        return { subscribed: false }
    } else {
        await db.subscription.create({
            data: {
                userId: session.user.id,
                modSlug
            }
        })
        revalidatePath(`/mod/${modSlug}`)
        return { subscribed: true }
    }
}

export async function getSubscriptionStatus(modSlug: string) {
    const session = await auth()
    if (!session?.user?.id) return { subscribed: false }

    const sub = await db.subscription.findUnique({
        where: {
            userId_modSlug: {
                userId: session.user.id,
                modSlug
            }
        }
    })

    return { subscribed: !!sub }
}

export async function markSubscriptionViewed(modSlug: string) {
    const session = await auth()
    if (!session?.user?.id) return

    await db.subscription.updateMany({
        where: {
            userId: session.user.id,
            modSlug
        },
        data: {
            lastViewedAt: new Date(),
            unseenVersions: 0
        }
    })
}

// ============ DOWNLOADS ============

export async function getDownloadHistory(page: number = 1, pageSize: number = 20) {
    const session = await auth()
    if (!session?.user?.id) return { downloads: [], hasMore: false }

    const downloads = await db.downloadHistory.findMany({
        where: { userId: session.user.id },
        include: {
            mod: {
                include: {
                    tags: {
                        include: { tag: true }
                    }
                }
            }
        },
        orderBy: { downloadedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize + 1 // Fetch one extra to check if there's more
    })

    const hasMore = downloads.length > pageSize
    const items = downloads.slice(0, pageSize)

    return {
        downloads: items.map((dl: PrismaDownloadHistoryWithMod) => ({
            ...dl,
            mod: {
                ...dl.mod,
                tags: dl.mod.tags.map(mapPrismaTagToTagData)
            }
        })),
        hasMore
    }
}

export async function recordDownload(modSlug: string, version: string, sessionId: string) {
    const session = await auth()
    if (!session?.user?.id) return

    // Upsert - only create if doesn't exist for this session
    try {
        await db.downloadHistory.create({
            data: {
                userId: session.user.id,
                modSlug,
                version,
                sessionId
            }
        })

        // On successful record, increment the total download count on the Mod
        const mod = await db.mod.findUnique({
            where: { slug: modSlug },
            select: { downloads: true }
        })

        if (mod) {
            // downloads is a String in schema, so we parse, increment, and stringify
            const currentCount = parseInt(mod.downloads) || 0
            await db.mod.update({
                where: { slug: modSlug },
                data: { downloads: (currentCount + 1).toString() }
            })
        }
    } catch (error) {
        // Unique constraint violation usually, or other error
        // console.log("Download already recorded for this session or error:", error)
    }
}

// ============ VIEW HISTORY ============

const VIEW_HISTORY_LIMIT = 50
const VIEW_COOLDOWN_HOURS = 24 // Hours before same user can increment view count again

/**
 * Helper: Increment view count on a mod
 */
async function incrementModViews(modSlug: string) {
    const mod = await db.mod.findUnique({
        where: { slug: modSlug },
        select: { views: true }
    })

    if (mod) {
        const currentCount = parseInt(mod.views) || 0
        await db.mod.update({
            where: { slug: modSlug },
            data: { views: (currentCount + 1).toString() }
        })
    }
}

export async function getViewHistory() {
    const session = await auth()
    if (!session?.user?.id) return []

    const history = await db.viewHistory.findMany({
        where: { userId: session.user.id },
        include: {
            mod: {
                include: {
                    tags: {
                        include: { tag: true }
                    }
                }
            }
        },
        orderBy: { viewedAt: 'desc' },
        take: VIEW_HISTORY_LIMIT
    })

    return history.map((vh: PrismaViewHistoryWithMod) => ({
        ...vh,
        mod: {
            ...vh.mod,
            tags: vh.mod.tags.map(mapPrismaTagToTagData)
        }
    }))
}

/**
 * Record a view for an authenticated user.
 * Increments Mod.views only if user hasn't viewed in the last 24 hours.
 */
export async function recordView(modSlug: string) {
    const session = await auth()
    if (!session?.user?.id) return { recorded: false }

    const cooldownDate = new Date()
    cooldownDate.setHours(cooldownDate.getHours() - VIEW_COOLDOWN_HOURS)

    // Check for existing recent view
    const existingView = await db.viewHistory.findUnique({
        where: {
            userId_modSlug: {
                userId: session.user.id,
                modSlug
            }
        }
    })

    const shouldIncrementViews = !existingView || existingView.viewedAt < cooldownDate

    // Upsert view - update timestamp if exists, create if not
    await db.viewHistory.upsert({
        where: {
            userId_modSlug: {
                userId: session.user.id,
                modSlug
            }
        },
        update: {
            viewedAt: new Date()
        },
        create: {
            userId: session.user.id,
            modSlug
        }
    })

    // Increment view count only if outside cooldown window
    if (shouldIncrementViews) {
        await incrementModViews(modSlug)
    }

    // Clean up old entries beyond limit (FIFO)
    const allViews = await db.viewHistory.findMany({
        where: { userId: session.user.id },
        orderBy: { viewedAt: 'desc' },
        skip: VIEW_HISTORY_LIMIT
    })

    if (allViews.length > 0) {
        await db.viewHistory.deleteMany({
            where: {
                id: { in: allViews.map((v) => v.id) }
            }
        })
    }

    // Also reset unseen badge on subscription if subscribed
    await markSubscriptionViewed(modSlug)

    return { recorded: true, incremented: shouldIncrementViews }
}

/**
 * Record a view for an anonymous (non-authenticated) user.
 * Uses session ID for deduplication - one view per session per mod.
 */
export async function recordAnonymousView(modSlug: string, sessionId: string) {
    if (!modSlug || !sessionId) return { recorded: false }

    try {
        // Try to create a new anonymous view record
        await db.anonymousView.create({
            data: {
                modSlug,
                sessionId
            }
        })

        // Successfully created = new view, increment count
        await incrementModViews(modSlug)

        return { recorded: true, incremented: true }
    } catch {
        // Unique constraint violation = already viewed from this session
        return { recorded: false, incremented: false }
    }
}

/**
 * Cleanup old anonymous views (older than 30 days).
 * Call this periodically (e.g., via cron job or on admin action).
 */
export async function cleanupOldAnonymousViews() {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const deleted = await db.anonymousView.deleteMany({
        where: {
            viewedAt: { lt: thirtyDaysAgo }
        }
    })

    return { deleted: deleted.count }
}

// ============ USER MODS (FOR AUTHORS) ============

export async function getUserMods() {
    const session = await auth()
    if (!session?.user?.id) return []

    // Check if user has author permissions
    if (!['DEVELOPER', 'MODERATOR', 'ADMIN'].includes(session.user.role)) {
        return []
    }

    const mods = await db.mod.findMany({
        where: { authorId: session.user.id },
        include: {
            tags: {
                include: { tag: true }
            }
        },
        orderBy: { updatedAt: 'desc' }
    })

    return mods.map((mod: PrismaModWithTags) => ({
        ...mod,
        tags: mod.tags.map(mapPrismaTagToTagData),
        updatedAt: mod.updatedAt.toISOString(),
        createdAt: mod.createdAt.toISOString()
    }))
}

export async function toggleModVisibility(slug: string) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Not authenticated")

    const mod = await db.mod.findUnique({ where: { slug } })
    if (!mod) throw new Error("Mod not found")

    // Check ownership or admin
    if (mod.authorId !== session.user.id && !['ADMIN', 'MODERATOR'].includes(session.user.role)) {
        throw new Error("Not authorized")
    }

    const newStatus = mod.status === 'published' ? 'hidden' : 'published'

    await db.mod.update({
        where: { slug },
        data: { status: newStatus }
    })

    revalidatePath('/profile/my-mods')
    revalidatePath(`/mod/${slug}`)

    return { status: newStatus }
}

export async function deleteUserMod(slug: string) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Not authenticated")

    const mod = await db.mod.findUnique({ where: { slug } })
    if (!mod) throw new Error("Mod not found")

    // Check ownership or admin
    if (mod.authorId !== session.user.id && !['ADMIN', 'MODERATOR'].includes(session.user.role)) {
        throw new Error("Not authorized")
    }

    await db.mod.delete({ where: { slug } })

    revalidatePath('/profile/my-mods')

    return { success: true }
}

// ============ PUBLIC PROFILE ============

export async function getUserProfileStats() {
    const session = await auth()
    if (!session?.user?.id) return null

    const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: {
            id: true,
            name: true,
            image: true,
            bio: true,
            role: true,
            createdAt: true,
        }
    })

    if (!user) return null

    // Get user's mods and calculate total downloads
    const userMods = await db.mod.findMany({
        where: { authorId: session.user.id },
        select: { downloads: true }
    })

    const modsCount = userMods.length
    const totalDownloads = userMods.reduce((acc, mod) => {
        return acc + (parseInt(mod.downloads) || 0)
    }, 0)

    // TODO: Comments and likes are not yet implemented in the schema
    // When implemented, fetch real counts here
    const commentsCount = 0
    const commentLikes = 0

    return {
        ...user,
        createdAt: user.createdAt.toISOString(),
        stats: {
            totalDownloads,
            modsCount,
            commentsCount,
            commentLikes
        }
    }
}

export async function updateUserBio(rawData: unknown): Promise<Result<{ bio: string }>> {
    const session = await auth()
    if (!session?.user?.id) {
        return err("Not authenticated")
    }

    // Validate with Zod (includes trim and max length check)
    const validated = validate(UserBioUpdateSchema, rawData)
    if (!validated.success) {
        return validated
    }

    try {
        await db.user.update({
            where: { id: session.user.id },
            data: { bio: validated.data.bio }
        })

        revalidatePath('/profile')

        return ok({ bio: validated.data.bio })
    } catch (error) {
        console.error("Failed to update bio:", error)
        return err("Failed to update bio")
    }
}

