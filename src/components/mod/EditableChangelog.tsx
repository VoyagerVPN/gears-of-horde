"use client";

import { useState, useEffect } from "react";
import { History, Plus, Trash2, Calendar as CalendarIcon } from "lucide-react";
import DatePicker from "@/components/ui/DatePicker";
import { ModChangelog } from "@/types/mod";
import { useTranslations, useLocale } from 'next-intl';

interface EditableChangelogProps {
  logs: ModChangelog[];
  onChange: (newLogs: ModChangelog[]) => void;
}

// Separate component for the changelog textarea to manage its own local state
interface ChangelogTextareaProps {
  changes: string[];
  onChange: (newChanges: string[]) => void;
  placeholder: string;
}

function ChangelogTextarea({ changes, onChange, placeholder }: ChangelogTextareaProps) {
  const t = useTranslations('Common');
  const [textValue, setTextValue] = useState(() => changes.join("\n"));
  const [isFocused, setIsFocused] = useState(false);

  // Sync from parent only when not focused
  useEffect(() => {
    if (!isFocused) {
      setTextValue(changes.join("\n"));
    }
  }, [changes, isFocused]);

  const handleBlur = () => {
    setIsFocused(false);
    // Process and send to parent on blur
    const newArray = textValue
      .split("\n")
      .map(line => line.trim())
      .filter(line => line.length > 0);
    onChange(newArray);
  };

  return (
    <div className="mt-4">
      <textarea
        rows={Math.max(4, changes.length + 1)}
        value={textValue}
        onChange={(e) => setTextValue(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={handleBlur}
        className="w-full bg-black/20 rounded-lg p-3 text-textMuted leading-relaxed text-sm outline-none resize-y placeholder:text-white/10 focus:text-white transition-colors font-mono border border-white/5 focus:border-primary/30"
        placeholder={placeholder}
        spellCheck={false}
      />
      <p className="text-[10px] text-textMuted mt-1 italic opacity-50">
        {t('enterEachChangeOnNewLine')}
      </p>
    </div>
  );
}

export default function EditableChangelog({ logs, onChange }: EditableChangelogProps) {
  const t = useTranslations('Common');
  const locale = useLocale() as 'en' | 'ru';

  // --- Управление версиями ---
  const addVersion = () => {
    // Логика копирования предыдущей версии
    const previousVersion = logs.length > 0 ? logs[0].version : "v1.0.0";

    const newEntry: ModChangelog = {
      version: previousVersion, // Копируем текст версии для удобства
      date: "", // Дата пустая, нужно выбрать вручную
      changes: [""]
    };
    // Добавляем в начало списка
    onChange([newEntry, ...logs]);
  };

  const removeVersion = (index: number) => {
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

  return (
    <div className="bg-surface border border-white/5 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="w-full flex items-center justify-between p-6 border-b border-white/5">
        <h2 className="text-lg font-bold text-white font-exo2 uppercase tracking-wide flex items-center gap-2">
          <History size={20} className="text-primary" /> {t('changelogEditor')}
        </h2>
        <button
          onClick={addVersion}
          className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold uppercase rounded border border-primary/20 hover:bg-primary hover:text-white transition-colors"
        >
          <Plus size={14} /> {t('newVersion')}
        </button>
      </div>

      <div className="p-6 space-y-8 bg-black/20">
        {logs.map((log, vIdx) => (
          <div key={vIdx} className="relative pl-6 border-l border-white/10 group/version">
            {/* Точка на таймлайне */}
            <div className="absolute -left-[5px] top-2.5 w-2.5 h-2.5 rounded-full bg-surface border-2 border-primary"></div>

            {/* Удаление версии */}
            <button
              onClick={() => removeVersion(vIdx)}
              className="absolute right-0 top-0 p-2 text-textMuted hover:text-red-500 transition-colors z-10"
              title={t('deleteVersion')}
            >
              <Trash2 size={16} />
            </button>

            {/* Хедер версии (Версия + Дата) */}
            <div className="flex flex-wrap items-center gap-6 mb-4">

              {/* Поле версии */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-textMuted uppercase">{t('version')}</label>
                <input
                  type="text"
                  value={log.version}
                  onChange={(e) => updateVersionHeader(vIdx, 'version', e.target.value)}
                  className="bg-transparent border-b border-white/10 focus:border-primary text-lg font-bold text-white w-32 outline-none transition-colors placeholder-white/20"
                  placeholder="v1.0.0"
                />
              </div>

              {/* Поле даты (DatePicker) */}
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

            {/* Список изменений (textarea-based with local state) */}
            <ChangelogTextarea
              changes={log.changes}
              onChange={(newChanges) => updateChanges(vIdx, newChanges)}
              placeholder={t('describeChange')}
            />
          </div>
        ))}

        {logs.length === 0 && (
          <div className="text-center py-8 text-textMuted text-sm italic border border-dashed border-white/10 rounded-lg">
            {t('noHistory')}
          </div>
        )}
      </div>
    </div>
  );
}