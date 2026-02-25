"use client";

import { useState, useMemo } from "react";
import { useTranslations } from 'next-intl';

import FeedbackHeader from "./feedback/FeedbackHeader";
import FeedbackInput from "./feedback/FeedbackInput";
import FeedbackItem from "./feedback/FeedbackItem";
import { FeedbackItem as FeedbackItemType, SortOption } from "./feedback/types";

// Mock data - in real app should come from props or API
const MOCK_FEEDBACK: FeedbackItemType[] = [
    {
        id: 1,
        date: "2023-10-25T10:30:00Z",
        user: "Survivor_99",
        type: "review",
        rating: 5,
        content: "This overhaul completely changed the game for me. The new class system is amazing!",
        likes: 12
    },
    {
        id: 2,
        date: "2023-11-01T08:15:00Z",
        user: "NoobSlayer",
        type: "comment",
        content: "Does this work with the latest experimental build?",
        likes: 1
    },
    {
        id: 3,
        date: "2023-10-23T15:45:00Z",
        user: "CraftMaster",
        type: "review",
        rating: 3.5,
        content: "Great mod, but the titanium grind is a bit too much in the late game. Otherwise perfect.",
        likes: 8
    },
    {
        id: 4,
        date: "2023-10-24T12:00:00Z",
        user: "Critic_MZ",
        type: "review",
        rating: 1,
        content: "Too hard, broke my save, unstable performance.",
        likes: 3
    },
    {
        id: 5,
        date: "2023-10-25T09:00:00Z",
        user: "AnotherUser",
        type: "review",
        rating: 5,
        content: "Just awesome.",
        likes: 2
    }
];

interface FeedbackSectionProps {
    locale?: 'en' | 'ru';
}

export default function FeedbackSection({ locale = 'en' }: FeedbackSectionProps) {
    const t = useTranslations('Common');
    const [activeTab, setActiveTab] = useState<'all' | 'reviews'>('all');
    const [sortOption, setSortOption] = useState<SortOption>('newest');

    const processedFeedback = useMemo(() => {
        // 1. Filter
        const filtered = activeTab === 'all'
            ? [...MOCK_FEEDBACK]
            : MOCK_FEEDBACK.filter(item => item.type === 'review');

        // 2. Sort
        filtered.sort((a, b) => {
            switch (sortOption) {
                case 'newest':
                    return new Date(b.date).getTime() - new Date(a.date).getTime();
                case 'popular':
                    return b.likes - a.likes;
                case 'highestRating':
                    const diffHigh = (b.rating ?? -1) - (a.rating ?? -1);
                    if (diffHigh !== 0) return diffHigh;
                    return new Date(b.date).getTime() - new Date(a.date).getTime();
                case 'lowestRating':
                    const diffLow = (a.rating ?? 6) - (b.rating ?? 6);
                    if (diffLow !== 0) return diffLow;
                    return new Date(b.date).getTime() - new Date(a.date).getTime();
                default:
                    return 0;
            }
        });

        return filtered;
    }, [activeTab, sortOption]);

    return (
        <section className="bg-surface rounded-xl border border-white/5 overflow-hidden" id="feedback">
            <FeedbackHeader
                activeTab={activeTab}
                onTabChange={setActiveTab}
                sortOption={sortOption}
                onSortChange={setSortOption}
            />

            <FeedbackInput />

            <div className="divide-y divide-white/5">
                {processedFeedback.map((item) => (
                    <FeedbackItem key={item.id} item={item} locale={locale} />
                ))}
            </div>

            <div className="p-4 text-center border-t border-white/5 bg-white/[0.01]">
                <button className="text-xs font-bold text-textMuted hover:text-white transition-colors uppercase tracking-widest">
                    {t('loadMore')}
                </button>
            </div>
        </section>
    );
}
