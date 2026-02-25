"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useRecentMods } from "@/hooks/useRecentMods";
import { useToast } from "@/shared/ui";

import UnifiedModLayout from "@/components/mod/UnifiedModLayout";
import DraftHistoryModal from "@/components/mod/editor/DraftHistoryModal";
import EditorToolbar from "@/components/mod/editor/EditorToolbar";

import { useModForm } from "./hooks/useModForm";
import { useDraftManager, clearModDraft } from "./hooks/useDraftManager";
import { useLinkUnfurler } from "./hooks/useLinkUnfurler";
import { validateModForm, parseValidationErrors } from "./lib/validation";
import { VisualModEditorProps } from "./types";

import { createMod } from "@/app/actions/mod-actions";
import { updateModAction } from "@/app/actions/admin-actions";
import { approveModSubmission } from "@/app/actions/mod-submission-actions";
import { calculateGameVersionColor } from "@/lib/utils";

export default function VisualModEditor({
    initialData,
    isNew = false,
    submissionId
}: VisualModEditorProps) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    const t = useTranslations("Admin");
    const tCommon = useTranslations("Common");
    const router = useRouter();
    const { showToast } = useToast();
    const { addToRecent } = useRecentMods();

    // Form management
    const {
        data,
        setData,
        gameVersionTags,
        setGameVersionTags,
        tempGameVersionTags,
        setTempGameVersionTags,
        refreshGameVersionTags,
        handleGameVersionCreate,
        handleUpdate
    } = useModForm({ initialData, isNew });

    // Draft management
    const draftKey = isNew ? "new" : (initialData?.slug || "new");
    
    const handleRestore = useCallback((restoredData: typeof data, restoredTempTags: typeof tempGameVersionTags) => {
        setData(restoredData);
        if (restoredTempTags.length > 0) {
            const allVersions = [
                ...gameVersionTags.map(t => t.displayName),
                ...restoredTempTags.map(t => t.displayName)
            ];
            setGameVersionTags(prev => prev.map(tag => ({
                ...tag,
                color: calculateGameVersionColor(tag.displayName, allVersions)
            })));
            setTempGameVersionTags(restoredTempTags.map(tag => ({
                ...tag,
                color: calculateGameVersionColor(tag.displayName, allVersions)
            })));
        }
    }, [gameVersionTags, setData, setTempGameVersionTags]);

    const {
        draftHistory,
        isAutosaving,
        lastSavedAt,
        saveNow,
        restoreDraft,
        deleteDraft,
        clearAllDrafts
    } = useDraftManager({
        draftKey,
        data,
        tempGameVersionTags,
        serverUpdatedAt: initialData?.updatedAt,
        onRestore: handleRestore
    });

    // Link unfurling
    const { unfurlLinkList } = useLinkUnfurler();

    // UI state
    const [isSaving, setIsSaving] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [warningConfirmed, setWarningConfirmed] = useState(false);
    const [invalidFields, setInvalidFields] = useState<Set<string>>(new Set());

    // Track last saved time to show autosave toast
    const [lastToastKey, setLastToastKey] = useState<string | null>(null);

    useEffect(() => {
        refreshGameVersionTags();
        if (!isNew && initialData?.slug && initialData?.title) {
            addToRecent(initialData.slug, initialData.title);
        }
    }, [isNew, initialData, refreshGameVersionTags, addToRecent]);

    useEffect(() => {
        if (lastSavedAt && lastSavedAt !== lastToastKey) {
            showToast(t("draftSaved"), "autosave");
            setLastToastKey(lastSavedAt);
        }
    }, [lastSavedAt, lastToastKey, showToast, t]);

    const clearFieldHighlight = useCallback((field: string) => {
        setInvalidFields(prev => {
            if (!prev.has(field)) return prev;
            const next = new Set(prev);
            next.delete(field);
            return next;
        });
    }, []);

    const handlePreviewToggle = async () => {
        if (!isPreviewMode) {
            const [newCommunity, newDonations] = await Promise.all([
                unfurlLinkList(data.links.community),
                unfurlLinkList(data.links.donations)
            ]);
            setData(prev => ({
                ...prev,
                links: { ...prev.links, community: newCommunity, donations: newDonations }
            }));
        }
        setIsPreviewMode(!isPreviewMode);
    };

    const handleSave = async () => {
        const validation = validateModForm(data, t);
        const newInvalidFields = new Set(validation.errors.map(e => e.field));
        setInvalidFields(newInvalidFields);

        if (!validation.valid) {
            validation.errors.forEach(err => showToast(err.message, "error"));
            setWarningConfirmed(false);
            return;
        }

        if (validation.warnings.length > 0 && !warningConfirmed) {
            validation.warnings.forEach(warn => showToast(warn, "warning"));
            setWarningConfirmed(true);
            return;
        }

        setWarningConfirmed(false);
        setIsSaving(true);

        const saveData = { ...data };
        const authorTags = data.tags.filter(t => t.category === 'author');
        if (!saveData.author?.trim() && authorTags.length > 0) {
            saveData.author = authorTags[0].displayName;
        }

        try {
            const [newCommunity, newDonations] = await Promise.all([
                unfurlLinkList(saveData.links.community),
                unfurlLinkList(saveData.links.donations)
            ]);
            saveData.links.community = newCommunity;
            saveData.links.donations = newDonations;

            if (isNew) {
                const result = await createMod(saveData);
                if (result.success) {
                    clearModDraft(draftKey);
                    if (submissionId) await approveModSubmission(submissionId);
                    showToast(t("modCreatedSuccess"), "success");
                    router.push(`/admin/mods/${result.data.slug}`);
                } else {
                    const formattedError = parseValidationErrors(result.error, t, tCommon);
                    showToast(formattedError, "error");
                }
            } else {
                const result = await updateModAction(initialData?.slug || data.slug, saveData);
                if (result.success) {
                    clearModDraft(draftKey);
                    showToast(t("modUpdatedSuccess"), "success");
                    if (initialData?.slug && data.slug !== initialData.slug) {
                        router.push(`/admin/mods/${data.slug}`);
                    }
                } else {
                    showToast(result.error, "error");
                }
            }
        } catch (error) {
            console.error("Failed to save mod:", error);
            showToast(t("saveError"), "error");
        } finally {
            setIsSaving(false);
        }
    };

    if (!mounted) return <div className="min-h-screen" />;

    return (
        <div className="min-h-screen pb-20">
            <DraftHistoryModal
                isOpen={showHistoryModal}
                onClose={() => setShowHistoryModal(false)}
                draftHistory={draftHistory}
                onRestore={restoreDraft}
                onDelete={deleteDraft}
                onClearAll={clearAllDrafts}
            />

            <EditorToolbar
                title={data.title}
                isNew={isNew}
                isSaving={isSaving}
                isAutosaving={isAutosaving}
                lastSavedAt={lastSavedAt}
                warningConfirmed={warningConfirmed}
                isPreviewMode={isPreviewMode}
                onSave={handleSave}
                onSaveDraft={saveNow}
                onHistoryClick={() => setShowHistoryModal(true)}
                onPreviewToggle={handlePreviewToggle}
            />

            <UnifiedModLayout
                mod={data}
                isEditing={!isPreviewMode}
                onUpdate={handleUpdate}
                initialStatus={initialData?.status}
                isNew={isNew}
                gameVersionTags={[...gameVersionTags, ...tempGameVersionTags]}
                onGameVersionTagsRefresh={refreshGameVersionTags}
                onGameVersionCreate={handleGameVersionCreate}
                invalidFields={invalidFields}
                onClearField={clearFieldHighlight}
            />
        </div>
    );
}
