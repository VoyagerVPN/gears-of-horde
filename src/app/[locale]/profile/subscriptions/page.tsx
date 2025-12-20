"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Heart, RefreshCw, Calendar } from "lucide-react"
import ModCard from "@/components/ModCard"
import { getSubscriptions } from "@/app/actions/profile-actions"

type SortType = 'update' | 'subscribed'

interface SubscriptionWithMod {
    id: string
    modSlug: string
    subscribedAt: string
    unseenVersions: number
    mod: {
        slug: string
        title: string
        version: string
        gameVersion: string
        author: string
        tags: { id: string; category: string; value: string; displayName: string; color: string | null }[]
        updatedAt: string
        rating: number
        downloads: string
        views: string
        bannerUrl?: string
        description?: string
    }
}

export default function ProfileSubscriptionsPage() {
    const t = useTranslations('Profile')
    const [subscriptions, setSubscriptions] = useState<SubscriptionWithMod[]>([])
    const [sortType, setSortType] = useState<SortType>('update')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadSubscriptions()
    }, [sortType])

    const loadSubscriptions = async () => {
        setLoading(true)
        const data = await getSubscriptions(sortType)
        setSubscriptions(data.map((sub) => ({
            ...sub,
            subscribedAt: typeof sub.subscribedAt === 'string' ? sub.subscribedAt : new Date(sub.subscribedAt).toISOString(),
            mod: {
                ...sub.mod,
                updatedAt: typeof sub.mod.updatedAt === 'string' ? sub.mod.updatedAt : new Date(sub.mod.updatedAt).toISOString()
            }
        })) as SubscriptionWithMod[])
        setLoading(false)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl lg:text-3xl font-bold text-white font-exo2 flex items-center gap-3">
                    <Heart className="text-primary" size={28} />
                    {t('subscriptions')}
                </h1>

                {/* Sort Toggle */}
                <div className="flex items-center gap-2 bg-surface border border-white/5 rounded-lg p-1">
                    <button
                        onClick={() => setSortType('update')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold uppercase transition-colors ${sortType === 'update'
                            ? 'bg-primary text-white'
                            : 'text-textMuted hover:text-white'
                            }`}
                    >
                        <RefreshCw size={12} />
                        {t('sortByUpdate')}
                    </button>
                    <button
                        onClick={() => setSortType('subscribed')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold uppercase transition-colors ${sortType === 'subscribed'
                            ? 'bg-primary text-white'
                            : 'text-textMuted hover:text-white'
                            }`}
                    >
                        <Calendar size={12} />
                        {t('sortBySubscribed')}
                    </button>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 bg-surface rounded-xl animate-pulse border border-white/5" />
                    ))}
                </div>
            ) : subscriptions.length === 0 ? (
                <div className="text-center py-20">
                    <Heart size={48} className="mx-auto text-textMuted/30 mb-4" />
                    <h2 className="text-lg font-bold text-white mb-2">{t('noSubscriptions')}</h2>
                    <p className="text-sm text-textMuted">{t('noSubscriptionsDesc')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {subscriptions.map((sub) => (
                        <div key={sub.id} className="relative group">
                            {sub.unseenVersions > 0 && (
                                <div className="absolute -top-2 -right-2 z-10 bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg animate-pulse">
                                    +{sub.unseenVersions}
                                </div>
                            )}
                            <ModCard
                                title={sub.mod.title}
                                slug={sub.mod.slug}
                                version={sub.mod.version}
                                gameVersion={sub.mod.gameVersion}
                                author={sub.mod.author}
                                tags={sub.mod.tags}
                                updatedAt={sub.mod.updatedAt}
                                bannerUrl={sub.mod.bannerUrl}
                                description={sub.mod.description || ''}
                                stats={{
                                    rating: sub.mod.rating,
                                    downloads: sub.mod.downloads,
                                    views: sub.mod.views
                                }}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
