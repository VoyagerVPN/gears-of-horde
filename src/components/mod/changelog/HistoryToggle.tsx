"use client";

import { ChevronUp, Plus } from "lucide-react";
import { useTranslations } from "next-intl";

interface HistoryToggleProps {
    showAll: boolean;
    hiddenCount: number;
    onToggle: () => void;
}

export default function HistoryToggle({ showAll, hiddenCount, onToggle }: HistoryToggleProps) {
    const t = useTranslations('Common');

    if (hiddenCount <= 0) return null;

    return (
        <div className="relative pl-8 pt-4">
            {!showAll && (
                <div className="absolute left-[-1px] top-0 h-4 w-[1px] bg-white/10" />
            )}

            <button
                type="button"
                onClick={onToggle}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-textMuted hover:text-white transition-colors"
            >
                {showAll ? (
                    <>
                        <ChevronUp size={14} /> {t('hideHistory')}
                    </>
                ) : (
                    <>
                        <Plus size={14} /> {t('showPreviousVersions')} ({hiddenCount})
                    </>
                )}
            </button>
        </div>
    );
}
