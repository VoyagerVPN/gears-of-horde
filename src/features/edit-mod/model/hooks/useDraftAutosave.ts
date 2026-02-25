/**
 * useDraftAutosave Hook
 * 
 * Manages autosave functionality for mod drafts.
 * Follows SRP: only draft management, isolated from form logic.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { DraftData, DraftExtraData } from '../types';

interface UseDraftAutosaveProps<T> {
  draftKey: string;
  data: T;
  extraData?: DraftExtraData;
  serverUpdatedAt?: string;
  intervalMs?: number;
}

interface UseDraftAutosaveReturn<T> {
  draftHistory: DraftData<T>[];
  isSaving: boolean;
  lastSavedAt: string | null;
  saveNow: () => void;
  restoreDraft: (draftId?: string) => DraftData<T> | null;
  deleteDraft: (draftId: string) => void;
  clearAllDrafts: () => void;
}

const STORAGE_KEY_PREFIX = 'mod_draft_';

export function useDraftAutosave<T>({
  draftKey,
  data,
  extraData,
  serverUpdatedAt,
  intervalMs = 5 * 60 * 1000 // 5 minutes
}: UseDraftAutosaveProps<T>): UseDraftAutosaveReturn<T> {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [draftHistory, setDraftHistory] = useState<DraftData<T>[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const storageKey = `${STORAGE_KEY_PREFIX}${draftKey}`;

  // Load draft history on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        setDraftHistory(parsed.history || []);
        setLastSavedAt(parsed.lastSavedAt || null);
      }
    } catch {
      // Ignore storage errors
    }
  }, [storageKey]);

  // Autosave interval
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      saveDraft();
    }, intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [intervalMs, data, extraData]);

  const saveDraft = useCallback(() => {
    setIsSaving(true);
    
    try {
      const draft: DraftData<T> = {
        id: Date.now().toString(),
        data,
        extraData,
        savedAt: new Date().toISOString()
      };

      setDraftHistory(prev => {
        const updated = [draft, ...prev].slice(0, 10); // Keep last 10 drafts
        
        localStorage.setItem(storageKey, JSON.stringify({
          history: updated,
          lastSavedAt: draft.savedAt,
          serverUpdatedAt
        }));
        
        return updated;
      });
      
      setLastSavedAt(draft.savedAt);
    } finally {
      setIsSaving(false);
    }
  }, [data, extraData, serverUpdatedAt, storageKey]);

  const saveNow = useCallback(() => {
    saveDraft();
  }, [saveDraft]);

  const restoreDraft = useCallback((draftId?: string): DraftData<T> | null => {
    if (draftId) {
      const draft = draftHistory.find(d => d.id === draftId);
      return draft || null;
    }
    // Return most recent draft
    return draftHistory[0] || null;
  }, [draftHistory]);

  const deleteDraft = useCallback((draftId: string) => {
    setDraftHistory(prev => {
      const updated = prev.filter(d => d.id !== draftId);
      localStorage.setItem(storageKey, JSON.stringify({
        history: updated,
        lastSavedAt,
        serverUpdatedAt
      }));
      return updated;
    });
  }, [lastSavedAt, serverUpdatedAt, storageKey]);

  const clearAllDrafts = useCallback(() => {
    localStorage.removeItem(storageKey);
    setDraftHistory([]);
    setLastSavedAt(null);
  }, [storageKey]);

  return {
    draftHistory,
    isSaving,
    lastSavedAt,
    saveNow,
    restoreDraft,
    deleteDraft,
    clearAllDrafts
  };
}

export function clearModDraft(draftKey: string): void {
  try {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}${draftKey}`);
  } catch {
    // Ignore storage errors
  }
}
