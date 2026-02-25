"use client";

import { Clock, ThumbsUp, Star, ArrowDown, ArrowUp } from "lucide-react";
import { useTranslations } from "next-intl";

export type SortOption = 'newest' | 'popular' | 'highestRating' | 'lowestRating';

interface SortButtonsProps {
    activeTab: 'all' | 'reviews';
    sortOption: SortOption;
    onSortChange: (option: SortOption) => void;
}

interface SortButtonConfig {
    option: SortOption;
    icon: React.ReactNode;
    label: string;
    showInTab: 'all' | 'reviews' | 'both';
}

export default function SortButtons({ activeTab, sortOption, onSortChange }: SortButtonsProps) {
    const t = useTranslations('Common');

    const buttons: SortButtonConfig[] = [
        { option: 'newest', icon: <Clock size={16} />, label: t('newestFirst'), showInTab: 'both' },
        { option: 'popular', icon: <ThumbsUp size={16} />, label: t('mostPopular'), showInTab: 'all' },
        {
            option: 'highestRating',
            icon: <div className="flex items-center"><Star size={14} fill="currentColor" /><ArrowDown size={12} className="-ml-1 mt-1" /></div>,
            label: t('highestRatingFirst'),
            showInTab: 'reviews'
        },
        {
            option: 'lowestRating',
            icon: <div className="flex items-center"><Star size={14} fill="currentColor" /><ArrowUp size={12} className="-ml-1 mt-1" /></div>,
            label: t('lowestRatingFirst'),
            showInTab: 'reviews'
        },
    ];

    const isVisible = (btn: SortButtonConfig) => {
        if (btn.showInTab === 'both') return true;
        return btn.showInTab === activeTab;
    };

    return (
        <div className="flex items-center justify-end gap-2">
            <span className="text-[10px] text-textMuted font-bold uppercase tracking-wider mr-2">{t('sortBy')}</span>
            {buttons.filter(isVisible).map(btn => {
                const isActive = sortOption === btn.option;
                return (
                    <button
                        key={btn.option}
                        onClick={() => onSortChange(btn.option)}
                        title={btn.label}
                        className={`p-2 rounded-lg transition-all border ${isActive
                                ? 'bg-primary/20 text-primary border-primary/30'
                                : 'bg-black/20 text-textMuted border-white/10 hover:border-white/30 hover:text-white'
                            }`}
                    >
                        {btn.icon}
                    </button>
                );
            })}
        </div>
    );
}
