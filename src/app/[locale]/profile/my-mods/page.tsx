"use client"

import { useState, useEffect, useCallback } from "react"
import { useTranslations } from "next-intl"
import { FileEdit, Plus, Trash2, Eye, Edit } from "lucide-react"
import { Link } from "@/i18n/routing"
import UnifiedUpdateModal from "@/components/mod/editor/UnifiedUpdateModal"
import { getUserMods, deleteUserMod } from "@/app/actions/author-actions"
import { fetchTagsByCategory } from "@/app/actions/tag-actions"
import { ModData, ModStatusType, TagData } from "@/types/mod"
import UnifiedTopBar from "@/components/ui/UnifiedTopBar"
import ConfirmModal from "@/components/ui/ConfirmModal"

export default function ProfileMyModsPage() {
    const t = useTranslations('Profile')
    const tCommon = useTranslations('Common')
    const [mods, setMods] = useState<ModData[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedMod, setSelectedMod] = useState<ModData | null>(null)
    const [showUpdateModal, setShowUpdateModal] = useState(false)
    const [gameVersionTags, setGameVersionTags] = useState<TagData[]>([])
    const [confirmDeleteSlug, setConfirmDeleteSlug] = useState<string | null>(null)

    const fetchMods = async () => {
        try {
            const data = await getUserMods()
            setMods(data)
        } catch (error) {
            console.error('Failed to load mods:', error)
        }
        setLoading(false)
    }

    // Refresh function for manual updates
    const refreshMods = useCallback(() => {
        return fetchMods()
    }, [])

    // Initial load
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchMods()
        fetchTagsByCategory('gamever').then(setGameVersionTags)
    }, [])

    const handleDeleteClick = (slug: string) => {
        setConfirmDeleteSlug(slug)
    }

    const executeDelete = async () => {
        if (!confirmDeleteSlug) return
        try {
            await deleteUserMod(confirmDeleteSlug)
            await refreshMods()
            setConfirmDeleteSlug(null)
        } catch (error) {
            console.error('Failed to delete mod:', error)
        }
    }

    const handleUpdateClick = (mod: ModData) => {
        setSelectedMod(mod)
        setShowUpdateModal(true)
    }

    // Helper to get status styling
    const getStatusStyle = (status: ModStatusType) => {
        switch (status) {
            case 'active':
                return 'bg-green-500/20 text-green-400'
            case 'on_hold':
                return 'bg-yellow-500/20 text-yellow-400'
            case 'discontinued':
            case 'upcoming':
            case 'unknown':
            default:
                return 'bg-red-500/20 text-red-400'
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <UnifiedTopBar
                title={
                    <div className="flex items-center gap-3">
                        <FileEdit className="text-primary" size={28} />
                        {t('myMods')}
                    </div>
                }
            >
                <Link
                    href="/author"
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-bold uppercase text-sm hover:bg-red-600 transition-colors"
                >
                    <Plus size={16} />
                    {t('createMod')}
                </Link>
            </UnifiedTopBar>

            {/* Content */}
            <div className="px-6 lg:px-8">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-64 bg-surface rounded-xl animate-pulse border border-white/5" />
                        ))}
                    </div>
                ) : mods.length === 0 ? (
                    <div className="text-center py-20">
                        <FileEdit size={48} className="mx-auto text-textMuted/30 mb-4" />
                        <h2 className="text-lg font-bold text-white mb-2">{t('noMods')}</h2>
                        <p className="text-sm text-textMuted mb-6">{t('noModsDesc')}</p>
                        <Link
                            href="/author"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-bold uppercase hover:bg-red-600 transition-colors"
                        >
                            <Plus size={18} />
                            {t('createFirstMod')}
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {mods.map((mod) => (
                            <div key={mod.slug} className="bg-surface rounded-xl border border-white/5 p-4">
                                <div className="flex items-start gap-4">
                                    {/* Mod Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-bold text-white font-exo2 truncate">
                                                {mod.title}
                                            </h3>
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${getStatusStyle(mod.status)}`}>
                                                {mod.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-textMuted truncate">{mod.description}</p>
                                        <div className="flex items-center gap-4 mt-2 text-xs text-textMuted">
                                            <span>v{mod.version}</span>
                                            <span>{mod.gameVersion}</span>
                                            <span>{mod.stats.downloads} downloads</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 shrink-0">
                                        <Link
                                            href={`/${mod.slug}`}
                                            className="p-2 text-textMuted hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                            title={tCommon('view')}
                                        >
                                            <Eye size={18} />
                                        </Link>
                                        <Link
                                            href={`/profile/mods/${mod.slug}`}
                                            className="p-2 text-textMuted hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                                            title={tCommon('edit')}
                                        >
                                            <Edit size={18} />
                                        </Link>
                                        <button
                                            onClick={() => handleUpdateClick(mod)}
                                            className="px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-lg hover:bg-primary/20 transition-colors"
                                        >
                                            {t('quickUpdate')}
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(mod.slug)}
                                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                                            title={tCommon('delete')}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Update Modal */}
                <UnifiedUpdateModal
                    key={selectedMod?.slug}
                    isOpen={showUpdateModal}
                    onClose={() => {
                        setShowUpdateModal(false)
                        setSelectedMod(null)
                    }}
                    mod={selectedMod || undefined}
                    onSave={async (_data) => {
                        // For now keep the logic of just refreshing, 
                        // though we should probably call an action here if the modal doesn't do it.
                        setShowUpdateModal(false)
                        setSelectedMod(null)
                        await refreshMods()
                    }}
                    gameVersionTags={gameVersionTags}
                />

                <ConfirmModal
                    isOpen={!!confirmDeleteSlug}
                    onClose={() => setConfirmDeleteSlug(null)}
                    onConfirm={executeDelete}
                    title={tCommon('deleteMod')}
                    message={t('deleteModConfirm')}
                    confirmText={tCommon('delete')}
                    cancelText={tCommon('cancel')}
                    variant="danger"
                />
            </div>
        </div>
    )
}
