"use client";

import { Star, ThumbsUp, MessageSquare, Flag } from "lucide-react";
import { useTranslations } from "next-intl";
import DateDisplay from "@/components/DateDisplay";
import { FeedbackItem as FeedbackItemType } from "./types";

interface FeedbackItemProps {
    item: FeedbackItemType;
    locale: 'en' | 'ru';
}

export default function FeedbackItem({ item, locale }: FeedbackItemProps) {
    const t = useTranslations('Common');

    return (
        <div className="p-6 hover:bg-white/[0.02] transition-colors group">
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
    );
}
