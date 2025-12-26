"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Link } from "@/i18n/routing"
import { usePathname } from "next/navigation"
import { FilePlus, FilePen, File, Trash2, ChevronDown, Pencil } from "lucide-react"
import { useTranslations } from "next-intl"
import { getAllDrafts, clearModDraft } from "@/hooks/useAutosave"
import { useRecentMods } from "@/hooks/useRecentMods"

const EDITOR_COLLAPSED_KEY = "sidebar-editor-collapsed"

interface DraftItem {
    slug: string
    title: string
    savedAt: string
}

interface EditorSubNavProps {
    normalizedPath: string
}

export default function EditorSubNav({ normalizedPath }: EditorSubNavProps) {
    const tAdmin = useTranslations('Admin')
    const tCommon = useTranslations('Common')
    const pathname = usePathname()

    // State
    const [drafts, setDrafts] = useState<DraftItem[]>([])
    const [isExpanded, setIsExpanded] = useState(true)
    const [mounted, setMounted] = useState(false)

    const { recentMods, refreshRecent } = useRecentMods()

    // Load persisted state after mount to avoid hydration mismatch
    useEffect(() => {
        setMounted(true)
        const stored = localStorage.getItem(EDITOR_COLLAPSED_KEY)
        if (stored === "true") {
            setIsExpanded(false)
        }
    }, [])

    // Persist collapse state
    const toggleExpanded = useCallback(() => {
        setIsExpanded(prev => {
            const newValue = !prev
            localStorage.setItem(EDITOR_COLLAPSED_KEY, newValue ? "false" : "true")
            return newValue
        })
    }, [])

    // Load drafts on mount and when pathname changes
    useEffect(() => {
        const loadDrafts = () => {
            const allDrafts = getAllDrafts()
            setDrafts(allDrafts)
        }

        loadDrafts()
        refreshRecent()

        // Refresh drafts every 30 seconds (reduced from 10s)
        const interval = setInterval(loadDrafts, 30000)
        return () => clearInterval(interval)
    }, [pathname, refreshRecent])

    // Auto-expand if on editor page
    useEffect(() => {
        if (normalizedPath.startsWith('/editor')) {
            setIsExpanded(true)
        }
    }, [normalizedPath])

    const isActive = normalizedPath === '/editor' || normalizedPath === '/editor/'
    const isEditorSection = normalizedPath.startsWith('/editor/')

    // Filter recent mods to exclude those with active drafts
    const filteredRecentMods = useMemo(() => {
        return recentMods.filter(mod => !drafts.some(d => d.slug === mod.slug))
    }, [recentMods, drafts])

    const hasDrafts = drafts.length > 0
    const hasRecents = filteredRecentMods.length > 0
    const hasContent = hasDrafts || hasRecents

    return (
        <div className="mb-2">
            {/* Collapsible Header */}
            <button
                onClick={toggleExpanded}
                className={`flex items-center gap-3 w-full px-3 py-2 text-xs font-bold uppercase rounded-lg transition-colors ${isActive || isEditorSection
                    ? 'text-primary bg-primary/10'
                    : 'text-textMuted hover:text-white hover:bg-white/5'
                    }`}
            >
                <Pencil size={16} className="shrink-0" />
                <span className="flex-1 text-left">{tAdmin('editor')}</span>
                <ChevronDown
                    size={14}
                    className={`shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Sub-Menu */}
            {mounted && isExpanded && (
                <div className="mt-1 ml-3 space-y-1 relative border-l border-white/10 pl-3">
                    {/* 1. New Mod Button */}
                    <Link
                        href="/editor"
                        className={`flex items-center gap-2 px-3 py-2 text-[11px] rounded-lg transition-colors group ${normalizedPath === '/editor'
                            ? 'text-primary bg-primary/10'
                            : 'text-textMuted hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <FilePlus size={14} className="shrink-0 group-hover:text-green-400 transition-colors" />
                        <span>{tAdmin('createNewMod')}</span>
                    </Link>

                    {/* 2. Drafts Section */}
                    {hasDrafts && (
                        <>
                            <div className="px-3 pt-2 pb-1 text-[9px] font-bold uppercase text-textMuted/50 tracking-wider">
                                {tAdmin('drafts')}
                            </div>
                            {drafts.map((draft) => (
                                <div
                                    key={`draft-${draft.slug}`}
                                    className={`relative flex items-center gap-2 px-3 py-2 text-[11px] rounded-lg transition-colors group ${normalizedPath === `/editor/${draft.slug}`
                                        ? 'text-primary bg-primary/10'
                                        : 'text-textMuted hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <Link
                                        href={`/editor/${draft.slug}`}
                                        className="flex items-center gap-2 flex-1 min-w-0"
                                        title={draft.title}
                                    >
                                        <FilePen size={14} className="shrink-0 text-amber-500/80" />
                                        <span className="truncate">{draft.title || draft.slug}</span>
                                    </Link>
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault()
                                            clearModDraft(draft.slug)
                                            setDrafts(prev => prev.filter(d => d.slug !== draft.slug))
                                        }}
                                        className="shrink-0 p-1 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all"
                                        title={tCommon('delete')}
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            ))}
                        </>
                    )}

                    {/* 3. Recent Mods Section */}
                    {hasRecents && (
                        <>
                            <div className="px-3 pt-2 pb-1 text-[9px] font-bold uppercase text-textMuted/50 tracking-wider">
                                {tAdmin('recentlyEdited')}
                            </div>
                            {filteredRecentMods.map((mod) => (
                                <Link
                                    key={`recent-${mod.slug}`}
                                    href={`/editor/${mod.slug}`}
                                    className={`flex items-center gap-2 px-3 py-2 text-[11px] rounded-lg transition-colors ${normalizedPath === `/editor/${mod.slug}`
                                        ? 'text-primary bg-primary/10'
                                        : 'text-textMuted hover:text-white hover:bg-white/5'
                                        }`}
                                    title={mod.title}
                                >
                                    <File size={14} className="shrink-0 opacity-50" />
                                    <span className="truncate">{mod.title || mod.slug}</span>
                                </Link>
                            ))}
                        </>
                    )}

                    {/* 4. Empty State */}
                    {!hasContent && (
                        <div className="px-3 py-2 text-[10px] text-textMuted/40 italic">
                            {tAdmin('noRecentActivity')}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
