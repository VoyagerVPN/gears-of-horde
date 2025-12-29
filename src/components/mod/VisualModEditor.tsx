"use client";

import { useState, useEffect, useCallback } from "react";
import { Save, Loader2, Cloud, History, Eye, Pencil } from "lucide-react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";

import { type ModData, type TagData, type ModLink } from "@/schemas";
import UnifiedModLayout from "@/components/mod/UnifiedModLayout";
import UnifiedTopBar from "@/components/ui/UnifiedTopBar";
import { createMod } from "@/app/actions/mod-actions";
import { updateModAction } from "@/app/actions/admin-actions";
import { fetchTagsByCategory } from "@/app/actions/tag-actions";
import { slugify, getLatestGameVersion, gameVersionToTagValue, calculateGameVersionColor, getFixedLinkName } from "@/lib/utils";
import { useAutosave, clearModDraft } from "@/hooks/useAutosave";
import { useRecentMods } from "@/hooks/useRecentMods";
import { useToast } from "@/components/ui/Toast";
import DraftHistoryModal from "./DraftHistoryModal";
import { approveModSubmission } from "@/app/actions/mod-submission-actions";

const EMPTY_MOD: ModData = {
    title: "",
    slug: "",
    version: "v1.0",
    author: "",
    description: "",
    status: "active",
    gameVersion: "V1.0",
    bannerUrl: "",
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

function formatRelativeTime(isoDate: string, t: (key: string, vars?: Record<string, string | number>) => string): string {
    const now = new Date();
    const date = new Date(isoDate);
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMinutes < 1) return t("relativeTime.justNow");
    if (diffMinutes < 60) return t("relativeTime.minutesAgo", { count: diffMinutes });
    if (diffHours < 24) return t("relativeTime.hoursAgo", { count: diffHours });
    return date.toLocaleDateString();
}

export default function VisualModEditor({
    initialData,
    isNew = false,
    submissionId
}: VisualModEditorProps) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    const t = useTranslations("Admin");
    const tCommon = useTranslations("Common");

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
    const [tempGameVersionTags, setTempGameVersionTags] = useState<TagData[]>([]);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const { showToast } = useToast();
    const router = useRouter();

    // Autosave hook
    const draftKey = isNew ? "new" : (initialData?.slug || "new");
    const {
        draftHistory,
        isSaving: isAutosaving,
        restoreDraft,
        deleteDraft,
        clearAllDrafts,
        saveNow,
        lastSavedAt,
    } = useAutosave<{ tempGameVersionTags?: TagData[] }>({
        draftKey,
        data,
        extraData: { tempGameVersionTags },
        serverUpdatedAt: initialData?.updatedAt,
        intervalMs: 5 * 60 * 1000, // 5 minutes
    });

    // Fetch game version tags on mount
    const refreshGameVersionTags = useCallback(() => {
        fetchTagsByCategory('gamever').then((tags) => {
            setGameVersionTags(tags);

            // Auto-select latest game version for new mods (if currently default V1.0)
            if (isNew) {
                const latest = getLatestGameVersion(tags, 'V1.4');

                setData(prev => {
                    if (prev.gameVersion === 'V1.0' || !prev.gameVersion) {
                        return { ...prev, gameVersion: latest };
                    }
                    return prev;
                });
            }
        });
    }, [isNew]);

    const { addToRecent } = useRecentMods();

    useEffect(() => {
        refreshGameVersionTags();
        if (!isNew && initialData?.slug && initialData?.title) {
            addToRecent(initialData.slug, initialData.title);
        }
    }, [isNew, initialData, refreshGameVersionTags, addToRecent]);

    // Track last saved time to show autosave toast
    const [lastToastKey, setLastToastKey] = useState<string | null>(null);

    // Show toast when autosave completes
    useEffect(() => {
        if (lastSavedAt && lastSavedAt !== lastToastKey) {
            showToast(t("draftSaved"), "autosave");
            setLastToastKey(lastSavedAt);
        }
    }, [lastSavedAt, lastToastKey, showToast, t]);

    const handleRestoreDraft = useCallback((draftId?: string) => {
        const restored = restoreDraft(draftId);
        if (restored) {
            // For existing mods, allow restoring the slug from the draft as well
            const restoredData = restored.data;
            setData(restoredData);

            // Restore temp game version tags if present, recalculating colors
            if (restored.extraData?.tempGameVersionTags && restored.extraData.tempGameVersionTags.length > 0) {
                const restoredTempTags = restored.extraData.tempGameVersionTags;

                // Calculate all versions for color gradient
                const allVersions = [
                    ...gameVersionTags.map(t => t.displayName),
                    ...restoredTempTags.map(t => t.displayName)
                ];

                // Recalculate colors for database tags
                setGameVersionTags(prev => prev.map(tag => ({
                    ...tag,
                    color: calculateGameVersionColor(tag.displayName, allVersions)
                })));

                // Recalculate colors for temp tags
                setTempGameVersionTags(restoredTempTags.map(tag => ({
                    ...tag,
                    color: calculateGameVersionColor(tag.displayName, allVersions)
                })));
            }
        }

    }, [restoreDraft, gameVersionTags, initialData?.slug, isNew]);



    const handleGameVersionCreate = (version: string) => {
        // Calculate all versions including db tags, existing temp tags, and the new one
        const allVersions = [
            ...gameVersionTags.map(t => t.displayName),
            ...tempGameVersionTags.map(t => t.displayName),
            version
        ];

        // Create the new tag with calculated color
        const newTag: TagData = {
            id: `temp-${Date.now()}`, // Temporary ID
            displayName: version,
            value: gameVersionToTagValue(version),
            category: 'gamever',
            color: calculateGameVersionColor(version, allVersions)
        };

        // Recalculate colors for ALL tags (db + temp) with the new version included
        setGameVersionTags(prev => prev.map(tag => ({
            ...tag,
            color: calculateGameVersionColor(tag.displayName, allVersions)
        })));

        setTempGameVersionTags(prev => {
            const updatedTempTags = prev.map(tag => ({
                ...tag,
                color: calculateGameVersionColor(tag.displayName, allVersions)
            }));
            return [...updatedTempTags, newTag];
        });

        // Select it
        setData(prev => ({ ...prev, gameVersion: version }));
    };

    // Warning confirmation state - when true, button shows "Confirm" and next click saves
    const [warningConfirmed, setWarningConfirmed] = useState(false);
    const [invalidFields, setInvalidFields] = useState<Set<string>>(new Set());

    const clearFieldHighlight = useCallback((field: string) => {
        setInvalidFields(prev => {
            if (!prev.has(field)) return prev;
            const next = new Set(prev);
            next.delete(field);
            return next;
        });
    }, []);

    // Auto-unfurl links that have URL but no Name (Shared logic)
    const unfurlLinkList = async (list: ModLink[]) => {
        return await Promise.all(list.map(async (link) => {
            if (!link.url) return link;

            // Check for fixed names first (always enforce these)
            const fixedName = getFixedLinkName(link.url);
            if (fixedName) {
                return { ...link, name: fixedName };
            }

            // If URL exists but Name is empty (and looks like a URL), try to unfurl
            if (!link.name && link.url.startsWith('http')) {
                try {
                    const response = await fetch("/api/unfurl", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ url: link.url }),
                    });
                    const res = await response.json();
                    if (res.success && res.title) {
                        return { ...link, name: res.title };
                    }
                } catch (err) {
                    console.error("Failed to auto-unfurl link:", link.url, err);
                }
            }
            return link;
        }));
    };

    const handlePreviewToggle = async () => {
        // If entering preview mode, update links first
        if (!isPreviewMode) {
            const [newCommunity, newDonations] = await Promise.all([
                unfurlLinkList(data.links.community),
                unfurlLinkList(data.links.donations)
            ]);

            setData(prev => ({
                ...prev,
                links: {
                    ...prev.links,
                    community: newCommunity,
                    donations: newDonations
                }
            }));
        }
        setIsPreviewMode(!isPreviewMode);
    };

    const handleSave = async () => {
        // Pre-save validation
        const errors: string[] = [];
        const warnings: string[] = [];
        const newInvalidFields = new Set<string>();

        // Required field checks (Errors)
        if (!data.title?.trim()) {
            errors.push(t("validationErrors.Title is required"));
            newInvalidFields.add('title');
        }
        const authorTags = data.tags.filter(t => t.category === 'author');
        if (!data.author?.trim() && authorTags.length === 0) {
            errors.push(t("validationErrors.Author is required"));
            newInvalidFields.add('author');
        }
        if (!data.version?.trim()) {
            errors.push(t("validationErrors.Version is required"));
            newInvalidFields.add('version');
        }
        if (!data.gameVersion?.trim()) {
            errors.push(t("validationErrors.Game version is required"));
            newInvalidFields.add('gameVersion');
        }

        const descriptionWords = data.description?.trim().split(/\s+/).filter(word => word.length > 0).length || 0;
        if (descriptionWords < 5) {
            errors.push(t("validationErrors.Description must contain at least 5 words"));
            newInvalidFields.add('description');
        }

        if (!data.bannerUrl?.trim()) {
            errors.push(t("validationErrors.Banner is required"));
            newInvalidFields.add('bannerUrl');
        }

        const contentTags = data.tags.filter(tag =>
            tag.category !== 'lang' &&
            tag.category !== 'gamever'
        );
        if (contentTags.length === 0) {
            errors.push(t("validationErrors.At least one tag is required"));
            newInvalidFields.add('tags');
        }

        if (!data.screenshots || data.screenshots.length === 0) {
            errors.push(t("validationErrors.At least one screenshot is required"));
            newInvalidFields.add('screenshots');
        }

        if (data.status !== 'upcoming' && !data.links.download?.trim()) {
            errors.push(t("validationErrors.Download link is required"));
            newInvalidFields.add('links.download');
        }

        setInvalidFields(newInvalidFields);

        // 1. If there are errors, show them and block
        if (errors.length > 0) {
            errors.forEach(err => showToast(err, "error"));
            setWarningConfirmed(false);
            return;
        }

        // 2. If no errors, check for warnings
        if (data.features.length === 0) {
            warnings.push(tCommon('featuresEmptyWarning'));
        }

        // 3. If there are warnings and they haven't been confirmed yet
        if (warnings.length > 0 && !warningConfirmed) {
            warnings.forEach(warn => showToast(warn, "warning"));
            setWarningConfirmed(true);
            return;
        }

        // Reset confirmation state after save attempt (if it reached here, it means it's ready to save)
        setWarningConfirmed(false);

        setIsSaving(true);
        // Prepare data for saving - ensure author is synced from tags if empty
        const saveData = { ...data };
        if (!saveData.author?.trim() && authorTags.length > 0) {
            saveData.author = authorTags[0].displayName;
        }

        try {
            // Process links concurrently before saving (using shared helper)
            const [newCommunity, newDonations] = await Promise.all([
                unfurlLinkList(saveData.links.community),
                unfurlLinkList(saveData.links.donations)
            ]);

            saveData.links.community = newCommunity;
            saveData.links.donations = newDonations;

            if (isNew) {
                const result = await createMod(saveData);
                if (result.success) {
                    // Clear draft on successful save
                    clearModDraft(draftKey);

                    // If this was from a submission, approve it
                    if (submissionId) {
                        await approveModSubmission(submissionId);
                    }

                    showToast(t("modCreatedSuccess"), "success");
                    router.push(`/admin/mods/${result.data.slug}`);
                } else {
                    // Helper to translate field paths to friendly names
                    const translateFieldPath = (path: string): string => {
                        // Handle changelog array paths like "changelog.0.date"
                        const changelogMatch = path.match(/^changelog\.(\d+)\.(\w+)$/);
                        if (changelogMatch) {
                            const idx = parseInt(changelogMatch[1]) + 1;
                            const field = changelogMatch[2];
                            const fieldName = field === 'date' ? tCommon('releaseDate') : field;
                            return `${tCommon('changelog')} #${idx} → ${fieldName}`;
                        }
                        // Simple field name translations
                        const fieldMap: Record<string, string> = {
                            'author': tCommon('authorName'),
                            'title': tCommon('modTitle'),
                            'slug': tCommon('modName'),
                            'version': tCommon('version'),
                            'gameVersion': tCommon('gameVersion'),
                            'description': tCommon('description'),
                            'bannerUrl': tCommon('bannerUrl'),
                            'tags': tCommon('tags'),
                            'screenshots': tCommon('screenshots'),
                        };
                        return fieldMap[path] || path;
                    };

                    // Split multiple validation errors and combine into single toast
                    const errors = result.error.split('\n');
                    const formattedErrors = errors.map(errorMsg => {
                        // Parse "field.path: Error message" format
                        const colonIdx = errorMsg.indexOf(': ');
                        if (colonIdx > 0) {
                            const fieldPath = errorMsg.substring(0, colonIdx);
                            const message = errorMsg.substring(colonIdx + 2);
                            const friendlyPath = translateFieldPath(fieldPath);
                            const translatedMessage = t.has(`validationErrors.${message}`)
                                ? t(`validationErrors.${message}`)
                                : message;
                            return `${friendlyPath}: ${translatedMessage}`;
                        }
                        return errorMsg;
                    }).filter(Boolean);

                    // Show all errors in one toast
                    showToast(formattedErrors.join('\n'), "error");
                }
            } else {
                await updateModAction(initialData?.slug || data.slug, {
                    ...saveData
                });
                // Clear draft on successful save
                clearModDraft(draftKey);
                showToast(t("modUpdatedSuccess"), "success");

                // If slug changed, redirect to the new slug's editor page
                if (!isNew && initialData?.slug && data.slug !== initialData.slug) {
                    router.push(`/admin/mods/${data.slug}`);
                }
            }
        } catch (error) {
            console.error("Failed to save mod:", error);
            showToast(t("saveError"), "error");
        } finally {
            setIsSaving(false);
        }
    };

    if (!mounted) {
        return <div className="min-h-screen bg-zinc-950" />;
    }

    return (
        <div className="min-h-screen bg-zinc-950 pb-20">



            {/* Draft History Modal */}
            <DraftHistoryModal
                isOpen={showHistoryModal}
                onClose={() => setShowHistoryModal(false)}
                draftHistory={draftHistory}
                onRestore={handleRestoreDraft}
                onDelete={deleteDraft}
                onClearAll={clearAllDrafts}
            />



            {/* === ADMIN TOP BAR === */}
            <UnifiedTopBar
                className="top-20"
                title={isNew ? t("createNewMod") : `${t("editing")}: ${data.title}`}
            >
                {/* Autosave status indicator */}
                <div className="flex items-center gap-1.5 text-xs text-textMuted">
                    {isAutosaving ? (
                        <>
                            <Loader2 size={14} className="animate-spin text-amber-400" />
                            <span className="text-amber-400">{t("autoSaveStatus.saving")}</span>
                        </>
                    ) : lastSavedAt ? (
                        <>
                            <Cloud size={14} className="text-green-400" />
                            <span className="text-green-400">
                                {t("autoSaveStatus.saved", { time: formatRelativeTime(lastSavedAt, t) })}
                            </span>
                        </>
                    ) : (
                        <>
                            <Cloud size={14} className="text-textMuted" />
                            <span>{t("autoSaveStatus.idle")}</span>
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
                    title={t("saveDraft")}
                >
                    <Save size={18} />
                </button>

                {/* Preview/Edit Toggle */}
                <button
                    onClick={handlePreviewToggle}
                    className={`p-2 rounded-lg transition-colors ${isPreviewMode ? 'bg-primary text-white' : 'text-textMuted hover:text-white hover:bg-white/5'}`}
                    title={isPreviewMode ? tCommon('edit') : tCommon('preview')}
                >
                    {isPreviewMode ? <Pencil size={18} /> : <Eye size={18} />}
                </button>

                <div className="w-px h-6 bg-white/10" />

                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`px-6 py-2 text-xs font-bold text-white rounded-lg flex items-center gap-2 transition-colors shadow-lg uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed ${warningConfirmed
                        ? 'bg-yellow-600 hover:bg-yellow-500 shadow-yellow-900/20'
                        : 'bg-primary hover:bg-red-600 shadow-red-900/20'
                        }`}
                >
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {isSaving ? t("saving") : warningConfirmed ? tCommon("confirm") : t("save")}
                </button>
            </UnifiedTopBar>

            <UnifiedModLayout
                mod={data}
                isEditing={!isPreviewMode}
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
                gameVersionTags={[...gameVersionTags, ...tempGameVersionTags]}
                onGameVersionTagsRefresh={refreshGameVersionTags}
                onGameVersionCreate={handleGameVersionCreate}
                invalidFields={invalidFields}
                onClearField={clearFieldHighlight}
            />

            {/* Floating Save Bar */}
        </div >
    );
}
