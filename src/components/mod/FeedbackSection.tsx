"use client";

import { useState, useMemo } from "react";
import { Star, User, ThumbsUp, MessageSquare, Flag, Clock, ArrowDown, ArrowUp } from "lucide-react";
import { useTranslations } from 'next-intl';
import DateDisplay from "@/components/DateDisplay";


// --- TYPES ---
type FeedbackType = 'comment' | 'review';
// Единый тип для всех возможных вариантов сортировки
type SortOption = 'newest' | 'popular' | 'highestRating' | 'lowestRating';

interface FeedbackItem {
  id: number;
  date: string; // ISO string
  user: string;
  type: FeedbackType;
  rating?: number;
  content: string;
  likes: number;
}

// --- MOCK DATA (Без изменений) ---
const MOCK_FEEDBACK: FeedbackItem[] = [
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


// --- MAIN COMPONENT ---
export default function FeedbackSection({ locale = 'en' }: { locale?: 'en' | 'ru' }) {
  const t = useTranslations('Common');
  const [activeTab, setActiveTab] = useState<'all' | 'reviews'>('all');
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [inputText, setInputText] = useState("");

  // Единое состояние сортировки
  const [sortOption, setSortOption] = useState<SortOption>('newest');

  // Сброс сортировки на 'newest' при переключении вкладок, если текущая опция недоступна


  // --- ЛОГИКА СОРТИРОВКИ ---
  const processedFeedback = useMemo(() => {
    // 1. Фильтрация
    const filtered = activeTab === 'all'
      ? [...MOCK_FEEDBACK]
      : MOCK_FEEDBACK.filter(item => item.type === 'review');

    // 2. Сортировка
    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'newest':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'popular':
          return b.likes - a.likes;
        case 'highestRating':
          // Сначала высокий рейтинг. Если равны - новые выше.
          const diffHigh = (b.rating ?? -1) - (a.rating ?? -1);
          if (diffHigh !== 0) return diffHigh;
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'lowestRating':
          // Сначала низкий рейтинг. Если равны - новые выше.
          const diffLow = (a.rating ?? 6) - (b.rating ?? 6);
          if (diffLow !== 0) return diffLow;
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [activeTab, sortOption]);

  // Рендеринг звезд для ввода (без изменений)
  const currentDisplayRating = hoverRating || userRating;
  const renderInteractiveStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const isFull = currentDisplayRating >= i;
      const isHalf = currentDisplayRating === i - 0.5;

      stars.push(
        <div key={i} className="relative transition-transform hover:scale-110 w-6 h-6">
          <Star size={24} className="text-white opacity-20 absolute top-0 left-0" />
          <div
            className="absolute top-0 left-0 overflow-hidden transition-all"
            style={{ width: isFull ? '100%' : isHalf ? '50%' : '0%' }}
          >
            <Star size={24} fill="currentColor" className="text-yellow-500" />
          </div>
          <div
            className="absolute top-0 left-0 w-1/2 h-full cursor-pointer z-20"
            onMouseEnter={() => setHoverRating(i - 0.5)}
            onClick={() => setUserRating(i - 0.5 === userRating ? 0 : i - 0.5)}
          ></div>
          <div
            className="absolute top-0 right-0 w-1/2 h-full cursor-pointer z-20"
            onMouseEnter={() => setHoverRating(i)}
            onClick={() => setUserRating(i === userRating ? 0 : i)}
          ></div>
        </div>
      );
    }
    return stars;
  };

  // --- Вспомогательный компонент для кнопки сортировки ---
  const SortButton = ({ option, icon, label }: { option: SortOption, icon: React.ReactNode, label: string }) => {
    const isActive = sortOption === option;
    return (
      <button
        onClick={() => setSortOption(option)}
        title={label}
        className={`p-2 rounded-lg transition-all border ${isActive
          ? 'bg-primary/20 text-primary border-primary/30'
          : 'bg-black/20 text-textMuted border-white/10 hover:border-white/30 hover:text-white'
          }`}
      >
        {icon}
      </button>
    );
  };


  return (
    <section className="bg-surface rounded-xl border border-white/5 overflow-hidden" id="feedback">

      {/* HEADER & CONTROLS */}
      <div className="flex flex-col gap-4 px-6 py-4 border-b border-white/5 bg-white/[0.02]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-white font-exo2 uppercase tracking-wide flex items-center gap-2">
            <MessageSquare size={18} className="text-primary" />
            {t('feedback')}
          </h2>

          {/* Tab Switcher */}
          <div className="flex bg-black/20 rounded-lg p-1 border border-white/5">
            <button
              onClick={() => {
                setActiveTab('all');
                if (sortOption === 'highestRating' || sortOption === 'lowestRating') {
                  setSortOption('newest');
                }
              }}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${activeTab === 'all' ? 'bg-white/10 text-white' : 'text-textMuted hover:text-white'}`}
            >
              {t('all')}
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${activeTab === 'reviews' ? 'bg-white/10 text-white' : 'text-textMuted hover:text-white'}`}
            >
              {t('reviews')}
            </button>
          </div>
        </div>

        {/* --- НОВАЯ ИКОНОЧНАЯ СОРТИРОВКА --- */}
        <div className="flex items-center justify-end gap-2">
          <span className="text-[10px] text-textMuted font-bold uppercase tracking-wider mr-2">{t('sortBy')}</span>

          {/* Всегда показываем Newest (Часы) */}
          <SortButton
            option="newest"
            icon={<Clock size={16} />}
            label={t('newestFirst')}
          />

          {/* Опции для вкладки ALL (Newest + Popular) */}
          {activeTab === 'all' && (
            <SortButton
              option="popular"
              icon={<ThumbsUp size={16} />}
              label={t('mostPopular')}
            />
          )}

          {/* Опции для вкладки REVIEWS (Newest + Rating High/Low) */}
          {activeTab === 'reviews' && (
            <>
              <SortButton
                option="highestRating"
                icon={<div className="flex items-center"><Star size={14} fill="currentColor" /><ArrowDown size={12} className="-ml-1 mt-1" /></div>}
                label={t('highestRatingFirst')}
              />
              <SortButton
                option="lowestRating"
                icon={<div className="flex items-center"><Star size={14} fill="currentColor" /><ArrowUp size={12} className="-ml-1 mt-1" /></div>}
                label={t('lowestRatingFirst')}
              />
            </>
          )}
        </div>
      </div>

      {/* INPUT AREA (Без изменений) */}
      <div className="p-6 border-b border-white/5">
        <div className="flex gap-4">
          <div className="shrink-0 w-10 h-10 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-textMuted">
            <User size={20} />
          </div>

          <div className="flex-1">
            <textarea
              id="feedback-input"
              name="feedbackContent"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={userRating > 0 ? t('writeReviewPlaceholder') : t('writeCommentPlaceholder')}
              className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-sm text-white placeholder:text-textMuted/50 outline-none hover:border-white/20 focus:border-white/30 focus:bg-black/30 transition-all min-h-[100px] resize-y"
            />

            <div className="flex flex-wrap items-center justify-between mt-3 gap-4">

              <div className="flex items-center gap-3" onMouseLeave={() => setHoverRating(0)}>
                <div className="flex gap-1">
                  {renderInteractiveStars()}
                </div>
                <span className={`text-xs font-bold uppercase tracking-wider transition-colors min-w-[80px] ${userRating > 0 ? 'text-yellow-500' : 'text-textMuted'}`}>
                  {userRating > 0 ? `${userRating.toFixed(1)} ${t('starReview')}` : t('comment')}
                </span>
              </div>

              <button className="px-6 py-2 bg-primary hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-colors uppercase tracking-widest">
                {t('post')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FEED LIST (Без изменений) */}
      <div className="divide-y divide-white/5">
        {processedFeedback.map((item) => (
          <div key={item.id} className="p-6 hover:bg-white/[0.02] transition-colors group">
            <div className="flex gap-4">

              <div className="shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 border border-white/10 flex items-center justify-center text-white/50 font-bold text-xs">
                {item.user.charAt(0)}
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between mb-2 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white hover:text-primary cursor-pointer transition-colors">
                      {item.user}
                    </span>

                    {item.type === 'review' && item.rating && (
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full ml-2">
                        <Star size={12} fill="currentColor" className="text-yellow-500" />
                        <span className="text-[10px] font-bold text-yellow-500 leading-none mt-0.5">
                          {item.rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-textMuted font-mono">
                    <DateDisplay date={item.date} locale={locale} />
                  </span>
                </div>

                <p className="text-sm text-textMain leading-relaxed mb-3">
                  {item.content}
                </p>

                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-1.5 text-textMuted hover:text-white transition-colors group/like">
                    <ThumbsUp size={14} className="group-hover/like:text-green-400" />
                    <span className="text-[10px] font-bold">{item.likes > 0 ? item.likes : t('like')}</span>
                  </button>
                  <button className="flex items-center gap-1.5 text-textMuted hover:text-white transition-colors">
                    <MessageSquare size={14} />
                    <span className="text-[10px] font-bold">{t('reply')}</span>
                  </button>
                  <button className="ml-auto text-textMuted hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                    <Flag size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
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