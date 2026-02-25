"use client";

import { Plus } from "lucide-react";
import Tag from "@/components/ui/Tag";
import { TagData } from "@/app/actions/tag-actions";
import { useTranslations } from "next-intl";

interface TagSuggestionsProps {
    query: string;
    suggestions: TagData[];
    selectedTags: Array<{ displayName: string; category?: string; id?: string }>;
    category: string;
    isLoading: boolean;
    isSearching: boolean;
    onAdd: (tagName: string) => void;
    onToggle: (tagName: string) => void;
}

export default function TagSuggestions({
    query,
    suggestions,
    selectedTags,
    category,
    isLoading,
    isSearching,
    onAdd,
    onToggle
}: TagSuggestionsProps) {
    const t = useTranslations('Common');

    const isSelected = (tagName: string) => {
        return selectedTags.some(s => s.displayName.toLowerCase() === tagName.toLowerCase());
    };

    // Combine server suggestions with matching selected tags
    const matchingSelected = query
        ? selectedTags.filter(t =>
            t.displayName.toLowerCase().includes(query.toLowerCase()) &&
            (t.category === category || !t.category)
        )
        : [];

    const allSuggestions = [...suggestions];
    matchingSelected.forEach(selected => {
        if (!allSuggestions.some(s => s.displayName.toLowerCase() === selected.displayName.toLowerCase())) {
            allSuggestions.push({
                id: selected.id ?? `temp-${selected.displayName}`,
                displayName: selected.displayName,
                category: selected.category || category,
                usageCount: 0
            } as TagData);
        }
    });

    return (
        <div className="p-2">
            {/* Create Tag Option */}
            {query && !isSelected(query) && (
                <button
                    onClick={() => onAdd(query)}
                    className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-white/5 text-left transition-colors font-bold border-b border-white/5"
                >
                    <Plus size={14} className="text-primary" />
                    <span className="text-sm text-white">
                        {t('createTag')} &quot;<span className="text-primary truncate max-w-[200px] inline-block align-bottom">{query}</span>&quot;
                    </span>
                </button>
            )}

            {/* Suggestions */}
            {query && (
                <div className="p-2">
                    <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-textMuted mb-2 px-1">
                        <span>{t('suggestions')}</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 min-h-[40px]">
                        {allSuggestions.length > 0 ? (
                            allSuggestions.map(tag => {
                                const selected = isSelected(tag.displayName);
                                const count = (tag.usageCount || 0) + (selected ? 1 : 0);
                                return (
                                    <div
                                        key={tag.id || tag.displayName}
                                        className="cursor-pointer inline-flex items-center"
                                    >
                                        <Tag
                                            category={tag.category || category}
                                            value={tag.value}
                                            color={tag.color || undefined}
                                            showIcon={true}
                                            className={selected ? "!border-primary" : ""}
                                            onContentClick={() => onToggle(tag.displayName)}
                                            actions={[{
                                                icon: <span className="opacity-80">({count})</span>,
                                                onClick: () => onToggle(tag.displayName),
                                                variant: 'transparent'
                                            }]}
                                        >
                                            {tag.displayName}
                                        </Tag>
                                    </div>
                                );
                            })
                        ) : isLoading ? (
                            <>
                                <div className="h-7 w-20 bg-white/5 border border-white/5 rounded-md animate-pulse" />
                                <div className="h-7 w-16 bg-white/5 border border-white/5 rounded-md animate-pulse" />
                                <div className="h-7 w-24 bg-white/5 border border-white/5 rounded-md animate-pulse" />
                            </>
                        ) : isSearching ? null : (
                            <div className="w-full py-4 text-center text-sm text-textMuted italic">
                                {t('noTagsFound')}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
