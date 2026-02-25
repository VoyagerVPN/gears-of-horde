"use client";

import { Trash2, Calendar as CalendarIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { DatePicker, RichTextEditor } from "@/shared/ui";
import { ModChangelog } from "@/types/mod";

interface ChangelogEntryProps {
    entry: ModChangelog;
    index: number;
    isLast: boolean;
    showDelete: boolean;
    locale: 'en' | 'ru';
    onVersionChange: (index: number, value: string) => void;
    onDateChange: (index: number, value: string) => void;
    onChangesChange: (index: number, value: string[]) => void;
    onDelete: (index: number) => void;
}

export default function ChangelogEntry({
    entry,
    index,
    isLast,
    showDelete,
    locale,
    onVersionChange,
    onDateChange,
    onChangesChange,
    onDelete
}: ChangelogEntryProps) {
    const t = useTranslations('Common');

    return (
        <div className={`relative pl-8 ${isLast ? '' : 'border-l border-white/10'}`}>
            {/* Connection line for the last item */}
            {isLast && index > 0 && (
                <div className="absolute left-[-1px] top-0 h-3 w-[1px] bg-white/10" />
            )}

            {/* Dot */}
            <div className="absolute -left-[5px] top-2.5 w-2.5 h-2.5 rounded-full bg-surface border-2 border-primary" />

            {/* Header (Version + Date + Delete) */}
            <div className="flex flex-wrap items-center gap-4 mb-4">
                {showDelete && (
                    <button
                        type="button"
                        onClick={() => onDelete(index)}
                        className="p-1.5 text-textMuted hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                        title={t('deleteVersion')}
                    >
                        <Trash2 size={18} />
                    </button>
                )}

                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-textMuted uppercase">{t('version')}</label>
                    <input
                        id={`changelog-version-${index}`}
                        name={`changelog-version-${index}`}
                        type="text"
                        value={entry.version}
                        onChange={(e) => onVersionChange(index, e.target.value)}
                        className="bg-transparent border-b border-white/10 hover:border-white/20 focus:border-white/30 text-lg font-bold text-white w-32 outline-none transition-colors placeholder-white/20"
                        spellCheck={false}
                        placeholder="1.0.0.0"
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-textMuted uppercase flex items-center gap-1">
                        <CalendarIcon size={10} /> {t('releaseDate')}
                    </label>
                    <DatePicker
                        value={entry.date ? new Date(entry.date) : undefined}
                        onChange={(date) => onDateChange(index, date ? date.toISOString() : "")}
                        placeholder={t('pickDate')}
                        locale={locale}
                    />
                </div>
            </div>

            {/* Editor */}
            <div className="mt-4">
                <RichTextEditor
                    id={`changelog-text-${index}`}
                    name={`changelog-text-${index}`}
                    value={entry.changes.length === 1 ? entry.changes[0] : entry.changes.join("")}
                    onChange={(html) => onChangesChange(index, [html])}
                    placeholder={t('describeChange')}
                    minHeight="100px"
                />
            </div>
        </div>
    );
}
