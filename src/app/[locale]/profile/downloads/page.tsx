"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Download as DownloadIcon } from "lucide-react"
import ModCard from "@/components/ModCard"
import { getDownloadHistory } from "@/app/actions/profile-actions"
import UnifiedTopBar from "@/components/ui/UnifiedTopBar"

interface DownloadWithMod {
    id: string
    modSlug: string
    version: string
    downloadedAt: string
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

export default function ProfileDownloadsPage() {
    const t = useTranslations('Profile')
    const [downloads, setDownloads] = useState<DownloadWithMod[]>([])
    const [loading, setLoading] = useState(true)

    const loadDownloads = async () => {
        setLoading(true)
        const data = await getDownloadHistory()
        setDownloads(data.downloads.map((dl) => ({
            ...dl,
            downloadedAt: typeof dl.downloadedAt === 'string' ? dl.downloadedAt : new Date(dl.downloadedAt).toISOString(),
            mod: {
                ...dl.mod,
                updatedAt: typeof dl.mod.updatedAt === 'string' ? dl.mod.updatedAt : new Date(dl.mod.updatedAt).toISOString()
            }
        })) as DownloadWithMod[])
        setLoading(false)
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadDownloads()
    }, [])

    return (
        <div className="space-y-6">
            {/* Header */}
            <UnifiedTopBar
                title={
                    <div className="flex items-center gap-3">
                        <DownloadIcon className="text-primary" size={28} />
                        {t('downloads')}
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
                ) : downloads.length === 0 ? (
                    <div className="text-center py-20">
                        <DownloadIcon size={48} className="mx-auto text-textMuted/30 mb-4" />
                        <h2 className="text-lg font-bold text-white mb-2">{t('noDownloads')}</h2>
                        <p className="text-sm text-textMuted">{t('noDownloadsDesc')}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {downloads.map((dl) => (
                            <ModCard
                                key={dl.id}
                                title={dl.mod.title}
                                slug={dl.mod.slug}
                                version={dl.mod.version}
                                gameVersion={dl.mod.gameVersion}
                                author={dl.mod.author}
                                tags={dl.mod.tags}
                                updatedAt={dl.mod.updatedAt}
                                bannerUrl={dl.mod.bannerUrl}
                                description={dl.mod.description || ''}
                                stats={{
                                    rating: dl.mod.rating,
                                    downloads: dl.mod.downloads,
                                    views: dl.mod.views
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
