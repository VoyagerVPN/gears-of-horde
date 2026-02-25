"use client";

import { MessageSquare } from "lucide-react";
import { useTranslations } from "next-intl";
import SortButtons, { SortOption } from "./SortButtons";

interface FeedbackHeaderProps {
    activeTab: 'all' | 'reviews';
    onTabChange: (tab: 'all' | 'reviews') => void;
    sortOption: SortOption;
    onSortChange: (option: SortOption) => void;
}

export default function FeedbackHeader({
    activeTab,
    onTabChange,
    sortOption,
    onSortChange
}: FeedbackHeaderProps) {
    const t = useTranslations('Common');

    return (
        <div className="flex flex-col gap-4 px-6 py-4 border-b border-white/5 bg-white/[0.02]">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-lg font-bold text-white font-exo2 uppercase tracking-wide flex items-center gap-2">
                    <MessageSquare size={18} className="text-primary" />
                    {t('feedback')}
                </h2>

                <div className="flex bg-black/20 rounded-lg p-1 border border-white/5">
                    <button
                        onClick={() => {
                            onTabChange('all');
                            if (sortOption === 'highestRating' || sortOption === 'lowestRating') {
                                onSortChange('newest');
                            }
                        }}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${activeTab === 'all' ? 'bg-white/10 text-white' : 'text-textMuted hover:text-white'}`}
                    >
                        {t('all')}
                    </button>
                    <button
                        onClick={() => onTabChange('reviews')}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${activeTab === 'reviews' ? 'bg-white/10 text-white' : 'text-textMuted hover:text-white'}`}
                    >
                        {t('reviews')}
                    </button>
                </div>
            </div>

            <SortButtons
                activeTab={activeTab}
                sortOption={sortOption}
                onSortChange={onSortChange}
            />
        </div>
    );
}
