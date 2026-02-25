"use client";

import { useState } from "react";
import { User } from "lucide-react";
import { useTranslations } from "next-intl";
import StarRating from "./StarRating";

interface FeedbackInputProps {
    onSubmit?: (content: string, rating: number) => void;
}

export default function FeedbackInput({ onSubmit }: FeedbackInputProps) {
    const t = useTranslations('Common');
    const [text, setText] = useState("");
    const [rating, setRating] = useState(0);

    const handleSubmit = () => {
        if (!text.trim()) return;
        onSubmit?.(text, rating);
        setText("");
        setRating(0);
    };

    return (
        <div className="p-6 border-b border-white/5">
            <div className="flex gap-4">
                <div className="shrink-0 w-10 h-10 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-textMuted">
                    <User size={20} />
                </div>

                <div className="flex-1">
                    <textarea
                        id="feedback-input"
                        name="feedbackContent"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder={rating > 0 ? t('writeReviewPlaceholder') : t('writeCommentPlaceholder')}
                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-sm text-white placeholder:text-textMuted/50 outline-none hover:border-white/20 focus:border-white/30 focus:bg-black/30 transition-all min-h-[100px] resize-y"
                    />

                    <div className="flex flex-wrap items-center justify-between mt-3 gap-4">
                        <div className="flex items-center gap-3">
                            <StarRating value={rating} onChange={setRating} />
                            <span className={`text-xs font-bold uppercase tracking-wider transition-colors min-w-[80px] ${rating > 0 ? 'text-yellow-500' : 'text-textMuted'}`}>
                                {rating > 0 ? `${rating.toFixed(1)} ${t('starReview')}` : t('comment')}
                            </span>
                        </div>

                        <button
                            onClick={handleSubmit}
                            className="px-6 py-2 bg-primary hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-colors uppercase tracking-widest"
                        >
                            {t('post')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
