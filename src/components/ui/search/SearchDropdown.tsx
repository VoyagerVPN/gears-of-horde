"use client";

import { TrendingUp } from "lucide-react";
import { TagData } from "@/app/actions/tag-actions";
import Tag from "@/components/ui/Tag";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface SearchDropdownProps {
    suggestions: TagData[];
    popularTags: TagData[];
    highlightIndex: number;
    onSelectTag: (tag: TagData) => void;
}

export default function SearchDropdown({
    suggestions,
    popularTags,
    highlightIndex,
    onSelectTag
}: SearchDropdownProps) {
    const t = useTranslations('Common');

    const hasSuggestions = suggestions.length > 0;

    return (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-white/10 rounded-lg shadow-2xl z-50 overflow-hidden backdrop-blur-xl">
            {hasSuggestions ? (
                <div className="p-2 space-y-1">
                    <div className="text-[10px] uppercase tracking-wider text-textMuted px-2 py-1 font-semibold">
                        {t('suggestions')}
                    </div>
                    {suggestions.map((tag, idx) => (
                        <button
                            key={tag.id}
                            onClick={() => onSelectTag(tag)}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all",
                                idx === highlightIndex ? 'bg-white/10' : 'hover:bg-white/5'
                            )}
                        >
                            <Tag color={tag.color || undefined} className="text-xs pointer-events-none">
                                {tag.displayName}
                            </Tag>
                            <span className="text-[10px] text-textMuted ml-auto">
                                {tag.usageCount} {t('mods')}
                            </span>
                        </button>
                    ))}
                </div>
            ) : (
                <div className="p-4">
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-textMuted mb-3 font-semibold">
                        <TrendingUp size={12} />
                        {t('popularTags')}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {popularTags.map((tag, idx) => (
                            <button
                                key={tag.id}
                                onClick={() => onSelectTag(tag)}
                                className={cn(
                                    "transition-transform hover:scale-105 active:scale-95",
                                    idx === highlightIndex ? 'ring-2 ring-primary ring-offset-2 ring-offset-background rounded-full' : ''
                                )}
                            >
                                <Tag color={tag.color || undefined} className="text-xs cursor-pointer hover:brightness-110">
                                    {tag.displayName}
                                </Tag>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
