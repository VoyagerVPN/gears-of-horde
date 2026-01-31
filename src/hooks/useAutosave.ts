"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { ModData } from "@/types/mod";

export interface DraftData<T = Record<string, unknown>> {
    id: string;
    data: ModData;
    extraData?: T;
    savedAt: string;
}

export interface UseAutosaveOptions<T = Record<string, unknown>> {
    /** Unique key for this draft (e.g., mod slug or 'new') */
    draftKey: string;
    /** Current mod data to autosave */
    data: ModData;
    /** Optional extra data to save (e.g., temp tags) */
    extraData?: T;
    /** Server's updatedAt timestamp (for existing mods) */
    serverUpdatedAt?: string;
    /** Interval in milliseconds for autosave (default: 5 minutes) */
    intervalMs?: number;
    /** Maximum number of draft versions to keep (default: 10) */
    maxVersions?: number;
    /** Called when autosave completes */
    onSaved?: () => void;
}

export interface UseAutosaveReturn<T = Record<string, unknown>> {
    /** Whether any drafts exist in localStorage */
    hasDraft: boolean;
    /** All saved draft versions (newest first) */
    draftHistory: DraftData<T>[];
    /** Whether currently saving */
    isSaving: boolean;
    /** Load a specific draft into state (defaults to latest) */
    restoreDraft: (draftId?: string) => { data: ModData; extraData?: T } | null;
    /** Delete a specific draft by ID */
    deleteDraft: (draftId: string) => void;
    /** Clear all drafts for this mod */
    clearAllDrafts: () => void;
    /** Manually trigger a save */
    saveNow: () => void;
    /** Timestamp of last successful save */
    lastSavedAt: string | null;
}

const DRAFT_PREFIX = "mod-drafts-";

/**
 * Generate a unique ID for a draft
 */
function generateDraftId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Hook for autosaving mod data to localStorage with interval-based saving
 * and multi-version draft history support
 */
export function useAutosave<T = Record<string, unknown>>({
    draftKey,
    data,
    extraData,
    serverUpdatedAt,
    intervalMs = 5 * 60 * 1000, // 5 minutes default
    maxVersions = 10,
    onSaved,
}: UseAutosaveOptions<T>): UseAutosaveReturn<T> {
    const storageKey = `${DRAFT_PREFIX}${draftKey}`;
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [draftHistory, setDraftHistory] = useState<DraftData<T>[]>([]);
    const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
    const lastSavedData = useRef<string>("");
    const isInitialMount = useRef(true);

    // Load existing drafts on mount
    useEffect(() => {
        if (typeof window === "undefined") return;

        try {
            const stored = localStorage.getItem(storageKey);
            if (stored) {
                const parsed: DraftData[] = JSON.parse(stored);

                // Filter drafts newer than server data
                let validDrafts = parsed;
                if (serverUpdatedAt) {
                    const serverTime = new Date(serverUpdatedAt).getTime();
                    validDrafts = parsed.filter(draft => {
                        const draftTime = new Date(draft.savedAt).getTime();
                        return draftTime > serverTime;
                    });

                    // If all drafts are older than server, clear them
                    if (validDrafts.length === 0 && parsed.length > 0) {
                        localStorage.removeItem(storageKey);
                    } else if (validDrafts.length !== parsed.length) {
                        localStorage.setItem(storageKey, JSON.stringify(validDrafts));
                    }
                }

                setDraftHistory(validDrafts as DraftData<T>[]);
                if (validDrafts.length > 0) {
                    setLastSavedAt(validDrafts[0].savedAt);
                }
            }
        } catch (error) {
            console.error("Failed to load drafts:", error);
            localStorage.removeItem(storageKey);
        }
    }, [storageKey, serverUpdatedAt]);

    // Save to localStorage
    const saveDraft = useCallback(() => {
        if (typeof window === "undefined") return;

        const dataString = JSON.stringify({ data, extraData });

        // Don't save if data hasn't changed
        if (dataString === lastSavedData.current) {
            return;
        }

        setIsSaving(true);

        try {
            const newDraft: DraftData<T> = {
                id: generateDraftId(),
                data,
                extraData,
                savedAt: new Date().toISOString(),
            };

            // Get existing drafts and add new one at the beginning
            const existingDrafts = [...draftHistory];
            existingDrafts.unshift(newDraft);

            // Limit to maxVersions
            const limitedDrafts = existingDrafts.slice(0, maxVersions);

            localStorage.setItem(storageKey, JSON.stringify(limitedDrafts));
            lastSavedData.current = dataString;
            setDraftHistory(limitedDrafts);
            setLastSavedAt(newDraft.savedAt);
            onSaved?.();
        } catch (error) {
            console.error("Failed to save draft:", error);
        } finally {
            setIsSaving(false);
        }
    }, [data, extraData, draftHistory, storageKey, maxVersions, onSaved]);

    // Interval-based autosave
    useEffect(() => {
        // Skip initial mount to avoid saving initial data immediately
        if (isInitialMount.current) {
            isInitialMount.current = false;
            lastSavedData.current = JSON.stringify(data);
            return;
        }

        // Clear existing interval
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        // Set up interval-based saving
        intervalRef.current = setInterval(() => {
            saveDraft();
        }, intervalMs);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [data, intervalMs, saveDraft]);

    // Restore a specific draft or the latest one
    const restoreDraft = useCallback((draftId?: string): { data: ModData; extraData?: T } | null => {
        if (draftHistory.length === 0) return null;

        const targetDraft = draftId
            ? draftHistory.find(d => d.id === draftId)
            : draftHistory[0];

        if (targetDraft) {
            return { data: targetDraft.data, extraData: targetDraft.extraData };
        }
        return null;
    }, [draftHistory]);

    // Delete a specific draft
    const deleteDraft = useCallback((draftId: string) => {
        if (typeof window === "undefined") return;

        const updatedDrafts = draftHistory.filter(d => d.id !== draftId);

        if (updatedDrafts.length === 0) {
            localStorage.removeItem(storageKey);
        } else {
            localStorage.setItem(storageKey, JSON.stringify(updatedDrafts));
        }

        setDraftHistory(updatedDrafts);

        // Update lastSavedAt if we still have drafts
        if (updatedDrafts.length > 0) {
            setLastSavedAt(updatedDrafts[0].savedAt);
        } else {
            setLastSavedAt(null);
        }
    }, [draftHistory, storageKey]);

    // Clear all drafts
    const clearAllDrafts = useCallback(() => {
        if (typeof window === "undefined") return;

        localStorage.removeItem(storageKey);
        setDraftHistory([]);
        setLastSavedAt(null);
    }, [storageKey]);

    // Manual save
    const saveNow = useCallback(() => {
        saveDraft();
    }, [saveDraft]);

    return {
        hasDraft: draftHistory.length > 0,
        draftHistory,
        isSaving,
        restoreDraft,
        deleteDraft,
        clearAllDrafts,
        saveNow,
        lastSavedAt,
    };
}

/**
 * Utility to clear all drafts for a mod by key (useful after successful save)
 */
export function clearModDraft(draftKey: string): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(`${DRAFT_PREFIX}${draftKey}`);
}

/**
 * Get all drafts from localStorage for display in sidebar
 * Returns an array of { slug, title, savedAt } for each mod with drafts
 */
export function getAllDrafts(): { slug: string; title: string; savedAt: string }[] {
    if (typeof window === "undefined") return [];

    const drafts: { slug: string; title: string; savedAt: string }[] = [];

    try {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(DRAFT_PREFIX)) {
                const slug = key.replace(DRAFT_PREFIX, "");
                const stored = localStorage.getItem(key);
                if (stored) {
                    const parsed: DraftData[] = JSON.parse(stored);
                    if (parsed.length > 0) {
                        drafts.push({
                            slug,
                            title: parsed[0].data.title || slug,
                            savedAt: parsed[0].savedAt,
                        });
                    }
                }
            }
        }
    } catch (error) {
        console.error("Failed to get all drafts:", error);
    }

    // Sort by most recent first
    return drafts.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
}
