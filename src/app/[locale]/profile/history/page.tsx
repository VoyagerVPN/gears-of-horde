"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { History as HistoryIcon } from "lucide-react"
import ModCard from "@/components/ModCard"
import { getViewHistory } from "@/app/actions/analytics-actions"
import UnifiedTopBar from "@/components/ui/UnifiedTopBar"

interface ViewWithMod {
    id: string
    modSlug: string
    viewedAt: string
    mod: {
        slug: string
        title: string
        version: string
        gameVersion: string
        author: string
        tags: { id: string; category: string; value: string; displayName: string; color: string | null }[]
        updatedAt: string
        stats: {
            rating: number
            downloads: string
            views: string
        }
        bannerUrl?: string
        description?: string
    }
}

export default function ProfileHistoryPage() {
    const t = useTranslations('Profile')
    const [history, setHistory] = useState<ViewWithMod[]>([])
    const [loading, setLoading] = useState(true)

    const loadHistory = async () => {
        setLoading(true)
        const data = await getViewHistory()
        setHistory(data.map((view) => ({
            ...view,
            viewedAt: typeof view.viewedAt === 'string' ? view.viewedAt : new Date(view.viewedAt).toISOString(),
            mod: {
                ...view.mod,
                updatedAt: typeof view.mod.updatedAt === 'string' 
                    ? view.mod.updatedAt 
                    : (view.mod.updatedAt ? new Date(view.mod.updatedAt).toISOString() : '')
            }
        })) as ViewWithMod[])
        setLoading(false)
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadHistory()
    }, [])

    return (
        <div className="space-y-6">
            {/* Header */}
            <UnifiedTopBar
                title={
                    <div className="flex items-center gap-3">
                        <HistoryIcon className="text-primary" size={28} />
                        {t('history')}
                    </div>
                }
            />

            {/* Content */}
            <div className="px-6 lg:px-8">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-64 bg-surface rounded-xl animate-pulse border border-white/5" />
                        ))}
                    </div>
                ) : history.length === 0 ? (
                    <div className="text-center py-20">
                        <HistoryIcon size={48} className="mx-auto text-textMuted/30 mb-4" />
                        <h2 className="text-lg font-bold text-white mb-2">{t('noHistory')}</h2>
                        <p className="text-sm text-textMuted">{t('noHistoryDesc')}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {history.map((view) => (
                            <ModCard
                                key={view.mod.slug}
                                mod={view.mod as any}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
