"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { User } from "lucide-react"
import { getUserProfileStats, getRecentActivity } from "@/app/actions/profile-actions"
import ProfileAvatarCard from "./ProfileAvatarCard"
import ProfileBioCard from "./ProfileBioCard"
import ProfileStatsGrid from "./ProfileStatsGrid"
import ProfileSocialLinks from "./ProfileSocialLinks"
import ProfileBadgesCard from "./ProfileBadgesCard"
import ProfileActivityFeed from "./ProfileActivityFeed"

export interface ProfileData {
    id: string
    name: string | null
    image: string | null
    bio: string | null
    role: string
    isProfilePublic: boolean
    profileViews: number
    createdAt: string
    socialLinks: { id: string; platform: string; url: string }[]
    badges: {
        id: string
        slug: string
        name: string
        icon: string
        description: string
        rarity: string
        earnedAt: string
    }[]
    stats: {
        totalDownloads: number
        modsCount: number
        commentsCount: number
        commentLikes: number
    }
}

export interface ActivityItem {
    type: 'mod_published' | 'mod_updated' | 'badge_earned'
    title: string
    slug?: string
    timestamp: string
}

export default function ProfileOverview() {
    const t = useTranslations('Profile')
    const [profile, setProfile] = useState<ProfileData | null>(null)
    const [activity, setActivity] = useState<ActivityItem[]>([])
    const [loading, setLoading] = useState(true)

    const loadProfile = async () => {
        setLoading(true)
        const [profileData, activityData] = await Promise.all([
            getUserProfileStats(),
            getRecentActivity()
        ])
        setProfile(profileData as ProfileData | null)
        setActivity(activityData)
        setLoading(false)
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadProfile()
    }, [])

    if (loading) {
        return (
            <div className="p-6 space-y-6">
                {/* Loading skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="h-64 bg-surface rounded-xl animate-pulse border border-white/5" />
                    <div className="lg:col-span-2 h-64 bg-surface rounded-xl animate-pulse border border-white/5" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="h-48 bg-surface rounded-xl animate-pulse border border-white/5" />
                    <div className="h-48 bg-surface rounded-xl animate-pulse border border-white/5" />
                </div>
            </div>
        )
    }

    if (!profile) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <User size={48} className="mx-auto text-textMuted/30 mb-4" />
                    <p className="text-textMuted">Failed to load profile</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <User className="text-primary" size={28} />
                <h1 className="text-2xl lg:text-3xl font-bold text-white font-exo2">
                    {t('overview')}
                </h1>
            </div>

            {/* Top Row: Avatar + Bio */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <ProfileAvatarCard
                    name={profile.name}
                    image={profile.image}
                    role={profile.role}
                    isPublic={profile.isProfilePublic}
                    onVisibilityChange={loadProfile}
                />
                <div className="lg:col-span-2">
                    <ProfileBioCard
                        bio={profile.bio}
                        onBioUpdate={loadProfile}
                    />
                </div>
            </div>

            {/* Middle Row: Stats + Social Links */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ProfileStatsGrid
                    createdAt={profile.createdAt}
                    profileViews={profile.profileViews}
                    modsCount={profile.stats.modsCount}
                    totalDownloads={profile.stats.totalDownloads}
                    commentsCount={profile.stats.commentsCount}
                    commentLikes={profile.stats.commentLikes}
                />
                <ProfileSocialLinks
                    links={profile.socialLinks}
                    onLinksUpdate={loadProfile}
                />
            </div>

            {/* Badges Row */}
            {profile.badges.length > 0 && (
                <ProfileBadgesCard badges={profile.badges} />
            )}

            {/* Activity Feed */}
            <ProfileActivityFeed activity={activity} />
        </div>
    )
}
