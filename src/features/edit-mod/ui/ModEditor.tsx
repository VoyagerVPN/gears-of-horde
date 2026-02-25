/**
 * Mod Editor Component
 * 
 * Main component for editing mods.
 * Composes form state, validation, and UI.
 * Follows SRP: orchestrates child components, contains minimal logic.
 */

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { ModEditorProps } from '../model/types';
import { useModForm } from '../model/hooks/useModForm';
import { useDraftAutosave, clearModDraft } from '../model/hooks/useDraftAutosave';
import { validateModForm, parseValidationErrors } from '../model/validation';
import { createMod, updateMod } from '../api';
import EditorToolbar from './EditorToolbar';

export default function ModEditor({
  initialData,
  isNew = false,
  submissionId: _submissionId,
  onSave,
  onCancel: _onCancel
}: ModEditorProps) {
  const t = useTranslations('Admin');
  const tCommon = useTranslations('Common');
  
  const [isSaving, setIsSaving] = useState(false);
  const [warningConfirmed, setWarningConfirmed] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Form state
  const { formData, setFormData: _setFormData, updateField: _updateField, isDirty: _isDirty } = useModForm({ initialData });

  // Draft autosave
  const draftKey = isNew ? 'new' : (initialData?.slug || 'new');
  const {
    draftHistory: _draftHistory,
    isSaving: isAutosaving,
    lastSavedAt,
    saveNow,
    restoreDraft: _restoreDraft,
    deleteDraft: _deleteDraft,
    clearAllDrafts: _clearAllDrafts
  } = useDraftAutosave({
    draftKey,
    data: formData,
    serverUpdatedAt: initialData?.updatedAt
  });

  // Handle save
  const handleSave = async () => {
    // Validate
    const validation = validateModForm(formData, t);

    if (!validation.valid) {
      validation.errors.forEach(err => {
        // Show toast or error notification
        console.error(err.message);
      });
      setWarningConfirmed(false);
      return;
    }

    // Check warnings
    if (validation.warnings.length > 0 && !warningConfirmed) {
      validation.warnings.forEach(warn => console.warn(warn));
      setWarningConfirmed(true);
      return;
    }

    setWarningConfirmed(false);
    setIsSaving(true);

    try {
      // Convert form data to Mod entity and save
      const result = isNew
        ? await createMod(formData as unknown as Parameters<typeof createMod>[0])
        : await updateMod(initialData!.slug, formData as unknown as Parameters<typeof updateMod>[1]);

      if (result.success) {
        clearModDraft(draftKey);
        onSave?.(result.data.mod);
      } else {
        const formattedError = parseValidationErrors(result.error, t, tCommon);
        console.error(formattedError);
      }
    } catch (error) {
      console.error('Failed to save mod:', error);
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <div className="min-h-screen pb-20">
      <div className="sticky top-20 z-30 bg-surface/95 backdrop-blur border-b border-white/5 px-6 py-3">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <h1 className="text-lg font-bold text-white">
            {isNew ? t('createNewMod') : `${t('editing')}: ${formData.title}`}
          </h1>

          <EditorToolbar
            title={formData.title}
            isNew={isNew}
            isSaving={isSaving}
            isAutosaving={isAutosaving}
            lastSavedAt={lastSavedAt}
            warningConfirmed={warningConfirmed}
            isPreviewMode={isPreviewMode}
            onSave={handleSave}
            onSaveDraft={saveNow}
            onHistoryClick={() => {/* TODO: Open draft history modal */}}
            onPreviewToggle={() => setIsPreviewMode(!isPreviewMode)}
          />
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 py-8">
        {/* Form content would go here */}
        <p className="text-textMuted">
          ModEditor placeholder. Form fields would be rendered here.
        </p>
      </div>
    </div>
  );
}
