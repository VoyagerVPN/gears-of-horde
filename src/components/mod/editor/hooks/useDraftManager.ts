"use client";

import { useCallback } from "react";
import { ModData, TagData } from "@/schemas";
import { useAutosave, clearModDraft } from "@/hooks/useAutosave";

interface UseDraftManagerProps {
    draftKey: string;
    data: ModData;
    tempGameVersionTags: TagData[];
    serverUpdatedAt?: string;
    onRestore?: (data: ModData, tempTags: TagData[]) => void;
}

interface UseDraftManagerReturn {
    draftHistory: ReturnType<typeof useAutosave>['draftHistory'];
    isAutosaving: boolean;
    lastSavedAt: string | null;
    saveNow: () => void;
    restoreDraft: (draftId?: string) => { data: ModData; extraData?: { tempGameVersionTags?: TagData[] } } | null;
    deleteDraft: (draftId: string) => void;
    clearAllDrafts: () => void;
}

export function useDraftManager({
    draftKey,
    data,
    tempGameVersionTags,
    serverUpdatedAt,
    onRestore
}: UseDraftManagerProps): UseDraftManagerReturn {
    const {
        draftHistory,
        isSaving: isAutosaving,
        restoreDraft: restoreDraftBase,
        deleteDraft,
        clearAllDrafts,
        saveNow,
        lastSavedAt,
    } = useAutosave<{ tempGameVersionTags?: TagData[] }>({
        draftKey,
        data,
        extraData: { tempGameVersionTags },
        serverUpdatedAt,
        intervalMs: 5 * 60 * 1000, // 5 minutes
    });

    const restoreDraft = useCallback((draftId?: string) => {
        const restored = restoreDraftBase(draftId);
        if (restored && onRestore) {
            onRestore(restored.data, restored.extraData?.tempGameVersionTags || []);
        }
        return restored;
    }, [restoreDraftBase, onRestore]);

    return {
        draftHistory,
        isAutosaving,
        lastSavedAt,
        saveNow,
        restoreDraft,
        deleteDraft,
        clearAllDrafts
    };
}

export { clearModDraft };
