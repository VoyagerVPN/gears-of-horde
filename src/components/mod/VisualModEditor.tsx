"use client";

import { useState, useEffect, useCallback } from "react";
import { Save, ArrowLeft, Loader2, RotateCcw, X, Cloud, History } from "lucide-react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";

import { type ModData, type TagData } from "@/schemas";
import UnifiedModLayout from "@/components/mod/UnifiedModLayout";
import { createMod } from "@/app/actions/mod-actions";
import { updateModAction } from "@/app/actions/admin-actions";
import { fetchTagsByCategory } from "@/app/actions/tag-actions";
import { slugify } from "@/lib/utils";
import { useAutosave, clearModDraft } from "@/hooks/useAutosave";
import { Toast } from "@/components/ui/Toast";
import DraftHistoryModal from "./DraftHistoryModal";
import { approveModSubmission } from "@/app/actions/mod-submission-actions";

const EMPTY_MOD: ModData = {
    title: "New Mod Title",
    slug: "new-mod",
    version: "v1.0",
    author: "",
    description: "",
    status: "active",
    gameVersion: "V1.0",
    isSaveBreaking: false,
    features: [],
    tags: [
        { displayName: "English", category: "lang", value: "EN", isExternal: false }
    ],
    installationSteps: [
        "Download the mod file.",
        "Extract the archive to your 7 Days to Die 'Mods' folder.",
        "Verify the folder structure: 'Mods/ModName/ModInfo.xml'.",
        "Start the game."
    ],
    links: { download: "", discord: "", community: [], donations: [] },
    stats: { rating: 0, ratingCount: 0, downloads: "0", views: "0" },
    videos: { trailer: "", review: "" },
    screenshots: [],
    changelog: [],
    localizations: [],
    createdAt: new Date().toISOString().split('T')[0] // Default to today for new mods
};

interface VisualModEditorProps {
    initialData?: ModData;
    isNew?: boolean;
    submissionId?: string; // If created from a submission, approve it on save
}

function formatRelativeTime(isoDate: string): string {
    const now = new Date();
    const date = new Date(isoDate);
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMinutes < 1) return "just now";
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
}

export default function VisualModEditor({
    initialData,
    isNew = false,
    submissionId
}: VisualModEditorProps) {
    const t = useTranslations("Admin");

    const [data, setData] = useState<ModData>(() => {
        const base = initialData || EMPTY_MOD;
        // Ensure EN localization exists
        let localizations = base.localizations || [];
        if (!localizations.some(loc => loc.code === 'EN')) {
            localizations = [
                { code: "EN", name: "English", type: 'builtin', url: "" },
                ...localizations
            ];
        }
        return { ...base, localizations };
    });

    const [isSaving, setIsSaving] = useState(false);
    const [gameVersionTags, setGameVersionTags] = useState<TagData[]>([]);
    const [showDraftBanner, setShowDraftBanner] = useState(true);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [lastToastKey, setLastToastKey] = useState<string | null>(null);
    const router = useRouter();

    // Autosave hook
    const draftKey = isNew ? "new" : (initialData?.slug || "new");
    const {
        hasDraft,
        draftHistory,
        isSaving: isAutosaving,
        restoreDraft,
        deleteDraft,
        clearAllDrafts,
        saveNow,
        lastSavedAt,
    } = useAutosave({
        draftKey,
        data,
        serverUpdatedAt: initialData?.updatedAt,
        intervalMs: 5 * 60 * 1000, // 5 minutes
    });

    // Fetch game version tags on mount
    const refreshGameVersionTags = () => {
        fetchTagsByCategory('gamever').then(setGameVersionTags);
    };

    useEffect(() => {
        refreshGameVersionTags();
    }, []);

    // Show toast when autosave completes
    useEffect(() => {
        if (lastSavedAt && lastSavedAt !== lastToastKey) {
            setShowToast(true);
            setLastToastKey(lastSavedAt);
        }
    }, [lastSavedAt, lastToastKey]);

    const handleRestoreDraft = useCallback((draftId?: string) => {
        const restoredData = restoreDraft(draftId);
        if (restoredData) {
            setData(restoredData);
        }
        setShowDraftBanner(false);
    }, [restoreDraft]);

    const handleDiscardDraft = useCallback(() => {
        clearAllDrafts();
        setShowDraftBanner(false);
    }, [clearAllDrafts]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            if (isNew) {
                const result = await createMod(data);
                if (result.success) {
                    // Clear draft on successful save
                    clearModDraft(draftKey);

                    // If this was from a submission, approve it
                    if (submissionId) {
                        await approveModSubmission(submissionId);
                    }

                    alert("Mod created successfully!");
                    router.push(`/profile/mods/${result.data.slug}`);
                } else {
                    alert(`Failed to create mod: ${result.error}`);
                }
            } else {
                await updateModAction(data.slug, data);
                // Clear draft on successful save
                clearModDraft(draftKey);
                alert("Mod updated successfully!");
            }
        } catch (error) {
            console.error("Failed to save mod:", error);
            alert("An error occurred while saving.");
        } finally {
            setIsSaving(false);
        }
    };

    // Format draft date for display
    const formatDraftDate = (isoDate: string) => {
        const date = new Date(isoDate);
        return date.toLocaleString();
    };

    return (
        <div className="min-h-screen bg-zinc-950 pb-20">

            {/* Toast notification */}
            <Toast
                message={t("draftSaved")}
                variant="autosave"
                isVisible={showToast}
                onClose={() => setShowToast(false)}
                duration={3000}
            />

            {/* Draft History Modal */}
            <DraftHistoryModal
                isOpen={showHistoryModal}
                onClose={() => setShowHistoryModal(false)}
                draftHistory={draftHistory}
                onRestore={handleRestoreDraft}
                onDelete={deleteDraft}
                onClearAll={clearAllDrafts}
            />

            {/* === DRAFT RECOVERY BANNER === */}
            {hasDraft && showDraftBanner && draftHistory.length > 0 && (
                <div className="mx-6 mb-4 mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <History size={20} className="text-amber-400" />
                        <span className="text-amber-200 text-sm">
                            {t("draftFound", { date: formatDraftDate(draftHistory[0].savedAt) })}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowHistoryModal(true)}
                            className="px-3 py-1.5 text-xs font-bold text-amber-300 hover:text-white border border-amber-500/30 hover:border-amber-500 rounded-lg flex items-center gap-1.5 transition-colors"
                        >
                            <History size={14} />
                            {t("draftHistory")}
                        </button>
                        <button
                            onClick={() => handleRestoreDraft()}
                            className="px-3 py-1.5 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-lg flex items-center gap-1.5 transition-colors"
                        >
                            <RotateCcw size={14} />
                            {t("restoreDraft")}
                        </button>
                        <button
                            onClick={handleDiscardDraft}
                            className="px-3 py-1.5 text-xs font-bold text-amber-300 hover:text-white border border-amber-500/30 hover:border-amber-500 rounded-lg flex items-center gap-1.5 transition-colors"
                        >
                            <X size={14} />
                            {t("discardDraft")}
                        </button>
                    </div>
                </div>
            )}

            {/* === ADMIN TOP BAR === */}
            <div className="flex items-center justify-between mb-8 sticky top-20 z-40 bg-[#191919]/90 backdrop-blur-md py-4 border-b border-white/10 mx-6 px-6 rounded-xl shadow-2xl">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-white/5 rounded-lg text-textMuted hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-white font-exo2 leading-none flex items-center gap-2">
                            {isNew ? t("createNewMod") : `${t("editing")}: ${data.title}`}
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Autosave status indicator */}
                    <div className="flex items-center gap-1.5 text-xs text-textMuted">
                        {isAutosaving ? (
                            <>
                                <Loader2 size={14} className="animate-spin text-amber-400" />
                                <span className="text-amber-400">{t("saving")}</span>
                            </>
                        ) : lastSavedAt ? (
                            <>
                                <Cloud size={14} className="text-green-400" />
                                <span className="text-green-400">
                                    {t("lastSavedAt", { time: formatRelativeTime(lastSavedAt) })}
                                </span>
                            </>
                        ) : (
                            <>
                                <Cloud size={14} className="text-textMuted" />
                                <span>{t("autosaved")}</span>
                            </>
                        )}
                    </div>

                    <div className="w-px h-6 bg-white/10" />

                    {/* Draft History button */}
                    <button
                        onClick={() => setShowHistoryModal(true)}
                        className="p-2 text-textMuted hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                        title={t("draftHistory")}
                    >
                        <History size={18} />
                    </button>

                    {/* Manual save button */}
                    <button
                        onClick={saveNow}
                        className="p-2 text-textMuted hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                        title={t("saving")}
                    >
                        <Cloud size={18} />
                    </button>

                    <div className="w-px h-6 bg-white/10" />

                    <button
                        onClick={handleDiscardDraft}
                        className="px-4 py-2 text-xs font-bold text-textMuted hover:text-white border border-white/10 rounded-lg transition-colors hover:bg-white/5 uppercase tracking-wider"
                    >
                        {t("discard")}
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-6 py-2 text-xs font-bold text-white bg-primary hover:bg-red-600 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-red-900/20 uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {isSaving ? t("saving") : t("submitMod")}
                    </button>
                </div>
            </div>

            <UnifiedModLayout
                mod={data}
                isEditing={true}
                onUpdate={(newData) => {
                    // Auto-generate slug from title for new mods
                    if (isNew && newData.title !== data.title) {
                        newData.slug = slugify(newData.title);
                    }
                    // Sync changelog version with mod version - when first changelog entry version changes
                    if (newData.changelog.length > 0 &&
                        data.changelog.length > 0 &&
                        newData.changelog[0].version !== data.changelog[0].version) {
                        newData.version = newData.changelog[0].version;
                    }
                    setData(newData);
                }}
                initialStatus={initialData?.status} // Pass initial status
                isNew={isNew}
                gameVersionTags={gameVersionTags}
                onGameVersionTagsRefresh={refreshGameVersionTags}
            />

            {/* Floating Save Bar */}
        </div>
    );
}
