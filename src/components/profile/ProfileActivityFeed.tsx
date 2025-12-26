"use client"

import { useTranslations } from "next-intl"
import { Activity, Package, RefreshCw, Award } from "lucide-react"
import { Link } from "@/i18n/routing"

interface ActivityItem {
    type: 'mod_published' | 'mod_updated' | 'badge_earned'
    title: string
    slug?: string
    timestamp: string
}

interface ProfileActivityFeedProps {
    activity: ActivityItem[]
}

function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const activityConfig: Record<ActivityItem['type'], { icon: React.ElementType; color: string }> = {
    mod_published: { icon: Package, color: 'text-green-400' },
    mod_updated: { icon: RefreshCw, color: 'text-blue-400' },
    badge_earned: { icon: Award, color: 'text-yellow-400' }
}

export default function ProfileActivityFeed({ activity }: ProfileActivityFeedProps) {
    const t = useTranslations('Profile')

    return (
        <div className="bg-surface border border-white/5 rounded-xl p-6">
            <div className="flex items-center gap-2 text-textMuted mb-4">
                <Activity size={16} />
                <span className="text-sm font-medium uppercase">{t('recentActivity')}</span>
            </div>

            {activity.length === 0 ? (
                <p className="text-textMuted/50 text-sm italic py-4 text-center">
                    {t('noActivity')}
                </p>
            ) : (
                <div className="space-y-3">
                    {activity.map((item, index) => {
                        const config = activityConfig[item.type]
                        const Icon = config.icon

                        return (
                            <div
                                key={index}
                                className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-white/5"
                            >
                                <div className={`p-2 rounded-lg bg-white/5 ${config.color}`}>
                                    <Icon size={16} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    {item.type === 'mod_published' && (
                                        <p className="text-sm text-white">
                                            Published{' '}
                                            {item.slug ? (
                                                <Link
                                                    href={`/mods/${item.slug}`}
                                                    className="text-primary hover:underline"
                                                >
                                                    {item.title}
                                                </Link>
                                            ) : (
                                                <span className="font-medium">{item.title}</span>
                                            )}
                                        </p>
                                    )}
                                    {item.type === 'mod_updated' && (
                                        <p className="text-sm text-white">
                                            Updated{' '}
                                            {item.slug ? (
                                                <Link
                                                    href={`/mods/${item.slug}`}
                                                    className="text-primary hover:underline"
                                                >
                                                    {item.title}
                                                </Link>
                                            ) : (
                                                <span className="font-medium">{item.title}</span>
                                            )}
                                        </p>
                                    )}
                                    {item.type === 'badge_earned' && (
                                        <p className="text-sm text-white">
                                            Earned badge: <span className="font-medium">{item.title}</span>
                                        </p>
                                    )}
                                </div>
                                <span className="text-xs text-textMuted shrink-0">
                                    {formatRelativeTime(item.timestamp)}
                                </span>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
