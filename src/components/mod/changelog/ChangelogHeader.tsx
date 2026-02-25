"use client";

import { History, Plus } from "lucide-react";
import { useTranslations } from "next-intl";

interface ChangelogHeaderProps {
    onAddVersion: () => void;
}

export default function ChangelogHeader({ onAddVersion }: ChangelogHeaderProps) {
    const t = useTranslations('Common');

    return (
        <div className="w-full flex items-center justify-between p-6 border-b border-white/5">
            <div className="flex items-center gap-4">
                <h2 className="text-lg font-bold text-white font-exo2 uppercase tracking-wide flex items-center gap-2">
                    <History size={20} className="text-primary" /> {t('changelogEditor')}
                </h2>

                <button
                    type="button"
                    onClick={onAddVersion}
                    className="p-2 text-primary hover:text-white hover:bg-primary/20 rounded-lg transition-colors"
                    title={t('addNewVersion')}
                >
                    <Plus size={20} />
                </button>
            </div>
        </div>
    );
}
