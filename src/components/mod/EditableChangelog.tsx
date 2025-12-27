"use client";

import { useState, useEffect } from "react";
import { History, Plus, Trash2, Calendar as CalendarIcon, ChevronUp } from "lucide-react";
import DatePicker from "@/components/ui/DatePicker";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { ModChangelog } from "@/types/mod";
import { useToast } from "@/components/ui/Toast";
import { useTranslations, useLocale } from 'next-intl';

interface EditableChangelogProps {
  logs: ModChangelog[];
  onChange: (newLogs: ModChangelog[]) => void;
}

// Simple component wrapper for the changelog editor
// Stores HTML content as-is, converting array to/from single HTML string
interface ChangelogEditorProps {
  id?: string;
  name?: string;
  changes: string[];
  onChange: (newChanges: string[]) => void;
  placeholder: string;
}

function ChangelogEditor({ id, name, changes, onChange, placeholder }: ChangelogEditorProps) {
  // Join array into single HTML string (for backwards compatibility)
  // New content will be stored as single-element array with full HTML
  const htmlValue = changes.length === 1 ? changes[0] : changes.join("");

  const handleChange = (html: string) => {
    // Store HTML as single element array
    onChange([html]);
  };

  return (
    <div className="mt-4">
      <RichTextEditor
        id={id}
        name={name}
        value={htmlValue}
        onChange={handleChange}
        placeholder={placeholder}
        minHeight="100px"
      />
    </div>
  );
}


export default function EditableChangelog({ logs, onChange }: EditableChangelogProps) {
  const t = useTranslations('Common');
  const locale = useLocale() as 'en' | 'ru';
  const { showToast } = useToast();
  // Show all history by default to avoid confusion with sorting
  const [showAllHistory, setShowAllHistory] = useState(true);

  // Ensure there is always at least one version on mount/update if empty
  useEffect(() => {
    if (logs.length === 0) {
      const initialEntry: ModChangelog = {
        version: "1.0.0.0",
        date: "",
        changes: [""]
      };
      onChange([initialEntry]);
    }
  }, [logs, onChange]);

  // --- Version Management ---
  const addVersion = () => {
    // Validation: Check if the latest version (first in list) has a date
    if (logs.length > 0 && !logs[0].date) {
      showToast(t('mustPickDateBeforeNewVersion'), 'warning');
      return;
    }

    const newEntry: ModChangelog = {
      version: "1.0.0.0",
      date: "",
      changes: [""]
    };
    // Add to top
    onChange([newEntry, ...logs]);
  };

  const removeVersion = (index: number) => {
    if (logs.length <= 1) return; // Prevent deleting last remaining version
    const newLogs = logs.filter((_, i) => i !== index);
    onChange(newLogs);
  };

  // Sort logs by date (newest first), entries without dates go to top
  const sortLogsByDate = (logsToSort: ModChangelog[]): ModChangelog[] => {
    return [...logsToSort].sort((a, b) => {
      // Entries without dates go to the top
      if (!a.date && !b.date) return 0;
      if (!a.date) return -1;
      if (!b.date) return 1;
      // Sort by date descending (newest first)
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  };

  const updateVersionHeader = (index: number, field: 'version' | 'date', value: string) => {
    const newLogs = [...logs];
    newLogs[index] = { ...newLogs[index], [field]: value };

    // Auto-sort by date when date field changes
    if (field === 'date') {
      onChange(sortLogsByDate(newLogs));
    } else {
      onChange(newLogs);
    }
  };

  const updateChanges = (versionIndex: number, newChanges: string[]) => {
    const newLogs = [...logs];
    newLogs[versionIndex].changes = newChanges;
    onChange(newLogs);
  };

  // Determine which logs to show
  const visibleCount = showAllHistory ? logs.length : 1;

  return (
    <div className="bg-surface border border-white/5 rounded-xl overflow-hidden">
      {/* Header with Add and Delete icons */}
      <div className="w-full flex items-center justify-between p-6 border-b border-white/5">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold text-white font-exo2 uppercase tracking-wide flex items-center gap-2">
            <History size={20} className="text-primary" /> {t('changelogEditor')}
          </h2>

          {/* Add Version Icon Button */}
          <button
            type="button"
            onClick={addVersion}
            className="p-2 text-primary hover:text-white hover:bg-primary/20 rounded-lg transition-colors"
            title={t('addNewVersion')}
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-8 relative">

          {logs.map((log, vIdx) => {
            // Logic to hide older versions
            if (vIdx >= visibleCount) return null;

            const isLast = vIdx === logs.length - 1;

            return (
              <div
                key={vIdx}
                className={`relative pl-8 ${isLast ? '' : 'border-l border-white/10'}`}
              >
                {/* Connection line for the last item (top to dot) */}
                {isLast && logs.length > 1 && (
                  <div className="absolute left-[-1px] top-0 h-3 w-[1px] bg-white/10"></div>
                )}

                {/* Dot */}
                <div className="absolute -left-[5px] top-2.5 w-2.5 h-2.5 rounded-full bg-surface border-2 border-primary"></div>

                {/* Header (Version + Date + Delete) */}
                <div className="flex flex-wrap items-center gap-4 mb-4">

                  {/* Delete Version Icon (only if more than 1 version) */}
                  {logs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVersion(vIdx)}
                      className="p-1.5 text-textMuted hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                      title={t('deleteVersion')}
                    >
                      <Trash2 size={18} />
                    </button>
                  )}

                  {/* Version Field */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-textMuted uppercase">{t('version')}</label>
                    <input
                      id={`changelog-version-${vIdx}`}
                      name={`changelog-version-${vIdx}`}
                      type="text"
                      value={log.version}
                      onChange={(e) => updateVersionHeader(vIdx, 'version', e.target.value)}
                      className="bg-transparent border-b border-white/10 hover:border-white/20 focus:border-white/30 text-lg font-bold text-white w-32 outline-none transition-colors placeholder-white/20"
                      spellCheck={false}
                      placeholder="1.0.0.0"
                    />
                  </div>

                  {/* Date Field */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-textMuted uppercase flex items-center gap-1">
                      <CalendarIcon size={10} /> {t('releaseDate')}
                    </label>
                    <DatePicker
                      value={log.date ? new Date(log.date) : undefined}
                      onChange={(date) => updateVersionHeader(vIdx, 'date', date ? date.toISOString() : "")}
                      placeholder={t('pickDate')}
                      locale={locale}
                    />
                  </div>
                </div>

                {/* Textarea */}
                <ChangelogEditor
                  id={`changelog-text-${vIdx}`}
                  name={`changelog-text-${vIdx}`}
                  changes={log.changes}
                  onChange={(newChanges) => updateChanges(vIdx, newChanges)}
                  placeholder={t('describeChange')}
                />
              </div>
            );
          })}

          {/* Show More / History Toggle */}
          {logs.length > 1 && (
            <div className="relative pl-8 pt-4">
              {/* Connection line from the visible item down to this button */}
              {!showAllHistory && (
                <div className="absolute left-[-1px] top-0 h-4 w-[1px] bg-white/10"></div>
              )}

              <button
                type="button"
                onClick={() => setShowAllHistory(!showAllHistory)}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-textMuted hover:text-white transition-colors"
              >
                {showAllHistory ? (
                  <>
                    <ChevronUp size={14} /> {t('hideHistory')}
                  </>
                ) : (
                  <>
                    <Plus size={14} /> {t('showPreviousVersions')} ({logs.length - 1})
                  </>
                )}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}