/**
 * Editor Toolbar Component
 * 
 * Toolbar for mod editor with save, preview, and draft controls.
 * Follows SRP: only toolbar UI, no form logic.
 */

'use client';

import { Save, Loader2, Cloud, History, Eye, Pencil } from "lucide-react";
import { useTranslations } from "next-intl";
import type { EditorToolbarProps } from '../model/types';

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

export default function EditorToolbar({
  title: _title,
  isNew: _isNew,
  isSaving,
  isAutosaving,
  lastSavedAt,
  warningConfirmed,
  isPreviewMode,
  onSave,
  onSaveDraft,
  onHistoryClick,
  onPreviewToggle
}: EditorToolbarProps) {
  const t = useTranslations("Admin");
  const tCommon = useTranslations("Common");

  return (
    <div className="flex items-center gap-3">
      {/* Autosave status */}
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

      {/* Draft History */}
      <button
        onClick={onHistoryClick}
        className="p-2 text-textMuted hover:text-white hover:bg-white/5 rounded-lg transition-colors"
        title={t("draftHistory")}
      >
        <History size={18} />
      </button>

      {/* Manual Save */}
      <button
        onClick={onSaveDraft}
        className="p-2 text-textMuted hover:text-white hover:bg-white/5 rounded-lg transition-colors"
        title={t("saveDraft")}
      >
        <Save size={18} />
      </button>

      {/* Preview Toggle */}
      <button
        onClick={onPreviewToggle}
        className={`p-2 rounded-lg transition-colors ${
          isPreviewMode 
            ? 'bg-primary text-white' 
            : 'text-textMuted hover:text-white hover:bg-white/5'
        }`}
        title={isPreviewMode ? tCommon('edit') : tCommon('preview')}
      >
        {isPreviewMode ? <Pencil size={18} /> : <Eye size={18} />}
      </button>

      <div className="w-px h-6 bg-white/10" />

      {/* Save Button */}
      <button
        onClick={onSave}
        disabled={isSaving}
        className={`px-6 py-2 text-xs font-bold text-white rounded-lg flex items-center gap-2 transition-colors shadow-lg uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed ${
          warningConfirmed
            ? 'bg-yellow-600 hover:bg-yellow-500 shadow-yellow-900/20'
            : 'bg-primary hover:bg-red-600 shadow-red-900/20'
        }`}
      >
        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
        {isSaving ? t("saving") : warningConfirmed ? tCommon("confirm") : t("save")}
      </button>
    </div>
  );
}
