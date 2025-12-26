"use client"

import { useTranslations } from "next-intl"
import { Calendar, Eye, Package, Download, MessageSquare, Star } from "lucide-react"

interface ProfileStatsGridProps {
    createdAt: string
    profileViews: number
    modsCount: number
    totalDownloads: number
    commentsCount: number
    commentLikes: number
}

interface StatItem {
    icon: React.ElementType
    label: string
    value: string | number
    color: string
}

function formatDate(dateString: string, locale: string = 'en'): string {
    const date = new Date(dateString)
    return date.toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

function formatNumber(num: number): string {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
}

export default function ProfileStatsGrid({
    createdAt,
    profileViews,
    modsCount,
    totalDownloads,
    commentsCount,
    commentLikes
}: ProfileStatsGridProps) {
    const t = useTranslations('Profile')

    const stats: StatItem[] = [
        { icon: Calendar, label: t('memberSince'), value: formatDate(createdAt), color: 'text-blue-400' },
        { icon: Eye, label: t('profileViews'), value: formatNumber(profileViews), color: 'text-purple-400' },
        { icon: Package, label: t('modsUploaded'), value: modsCount, color: 'text-green-400' },
        { icon: Download, label: t('totalDownloads'), value: formatNumber(totalDownloads), color: 'text-primary' },
        { icon: MessageSquare, label: t('comments'), value: commentsCount, color: 'text-cyan-400' },
        { icon: Star, label: t('commentLikes'), value: commentLikes, color: 'text-yellow-400' },
    ]

    return (
        <div className="bg-surface border border-white/5 rounded-xl p-6">
            <div className="flex items-center gap-2 text-textMuted mb-4">
                <Package size={16} />
                <span className="text-sm font-medium uppercase">{t('stats')}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className="bg-background/50 rounded-lg p-3 border border-white/5"
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <stat.icon size={14} className={stat.color} />
                            <span className="text-xs text-textMuted truncate">{stat.label}</span>
                        </div>
                        <p className="text-lg font-bold text-white truncate">{stat.value}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}
