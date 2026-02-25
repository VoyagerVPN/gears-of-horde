"use client";

import { History } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import DateDisplay from "@/components/DateDisplay";
import EditableChangelog from "@/components/mod/shared/EditableChangelog";
import { ModChangelog } from "@/types/mod";

interface ModChangelogSectionProps {
    changelog: ModChangelog[];
    isEditing: boolean;
    onUpdate: (changelog: ModChangelog[]) => void;
}

/**
 * Секция журнала изменений (Changelog). 
 * Показывает историю версий или предоставляет редактор в режиме редактирования.
 */
export default function ModChangelogSection({
    changelog,
    isEditing,
    onUpdate
}: ModChangelogSectionProps) {
    const t = useTranslations('Common');
    const locale = useLocale() as 'en' | 'ru';

    if (isEditing) {
        return (
            <EditableChangelog
                logs={changelog}
                onChange={onUpdate}
            />
        );
    }

    return (
        <section className="bg-surface rounded-xl p-6 border border-white/5">
            <h2 className="text-lg font-bold text-white mb-6 border-b border-white/5 pb-2 font-exo2 uppercase tracking-wide flex items-center justify-between">
                <span className="flex items-center gap-2">
                    <History size={20} className="text-primary" /> {t('changelog')}
                </span>
                <div className="flex items-center gap-2 text-xs text-textMuted font-normal normal-case tracking-normal">
                    {t('lastUpdated')}: <DateDisplay date={changelog[0]?.date || new Date().toISOString()} locale={locale} />
                </div>
            </h2>
            <div className="space-y-6">
                {changelog.map((log, idx) => (
                    <div key={idx} className="relative pl-6 border-l border-white/10">
                        <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-surface border-2 border-primary"></div>
                        <div className="flex items-baseline gap-3 mb-2">
                            <span className="text-base font-bold text-white">{log.version}</span>
                            <DateDisplay date={log.date} locale={locale} className="text-xs text-textMuted font-mono" />
                        </div>
                        <ul className="list-disc list-inside text-sm text-textMuted space-y-1">
                            {log.changes.map((change, cIdx) => (
                                <li key={cIdx}>{change}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </section>
    );
}
