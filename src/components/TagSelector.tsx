"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Plus, Tag as TagIcon, TrendingUp, Check, CircleUser } from 'lucide-react';
import { searchTags, fetchPopularTags, TagData } from '@/app/actions/tag-actions';
import Tag from '@/components/ui/Tag';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface TagSelectorProps {
    /** Currently selected tags */
    selectedTags: Array<{ displayName: string; category?: string; id?: string; color?: string | null }>;
    /** Callback when tags change */
    onTagsChange: (tags: Array<{ displayName: string; category: string }>) => void;
    /** Category to search/create tags in (default: 'tag') */
    category?: string;
    /** Placeholder text */
    placeholder?: string;
    /** Show popular tags section */
    showPopular?: boolean;
    /** Maximum number of tags */
    maxTags?: number;
    /** Additional className */
    className?: string;
    /** Hide the list of selected tags (useful if parent renders them differently) */
    hideSelectedTags?: boolean;
}

export default function TagSelector({
    selectedTags,
    onTagsChange,
    category = 'tag',
    placeholder,
    showPopular = true,
    maxTags,
    className,
    hideSelectedTags = false
}: TagSelectorProps) {
    const t = useTranslations('Common');
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<TagData[]>([]);
    const [popularTags, setPopularTags] = useState<TagData[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fetch popular tags on mount
    useEffect(() => {
        if (showPopular) {
            fetchPopularTags(8, category).then(tags => {
                setPopularTags(tags);
            });
        }
    }, [showPopular, category]);

    // Search tags as user types
    const handleSearch = useCallback(async (searchQuery: string) => {
        if (searchQuery.length < 1) {
            setSuggestions([]);
            return;
        }

        setIsLoading(true);
        try {
            const results = await searchTags(searchQuery, category);
            setSuggestions(results);
        } catch (error) {
            console.error('Error searching tags:', error);
            setSuggestions([]);
        } finally {
            setIsLoading(false);
        }
    }, [category]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            handleSearch(query);
        }, 200);
        return () => clearTimeout(timer);
    }, [query, handleSearch]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Helper to check if tag is selected
    const isSelected = (tagName: string) => {
        return selectedTags.some(s => s.displayName.toLowerCase() === tagName.toLowerCase());
    };

    const addTag = (tagName: string) => {
        if (!tagName.trim()) return;
        if (maxTags && selectedTags.length >= maxTags) return;
        if (isSelected(tagName)) return;

        onTagsChange([...selectedTags.map(t => ({ displayName: t.displayName, category: t.category || category })), { displayName: tagName.trim(), category }]);
        setQuery('');
        setSuggestions([]);
        // Keep dropdown open so user can add multiple tags
    };

    const removeTag = (tagName: string) => {
        onTagsChange(selectedTags.filter(t => t.displayName !== tagName).map(t => ({ displayName: t.displayName, category: t.category || category })));
    };

    const toggleTag = (tagName: string) => {
        if (isSelected(tagName)) {
            removeTag(tagName);
        } else {
            addTag(tagName);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (suggestions.length > 0) {
                toggleTag(suggestions[0].displayName);
            } else if (query.trim()) {
                addTag(query);
            }
        } else if (e.key === 'Escape') {
            setIsOpen(false);
            setQuery('');
        } else if (e.key === 'Backspace' && !query && selectedTags.length > 0) {
            removeTag(selectedTags[selectedTags.length - 1].displayName);
        }
    };

    // Combine server suggestions with matching selected tags (for local feedback)
    const matchingSelected = query
        ? selectedTags.filter(t =>
            t.displayName.toLowerCase().includes(query.toLowerCase()) &&
            (t.category === category || !t.category)
        )
        : [];

    // Deduplicate suggestions + matching selected
    const allSuggestions = [...suggestions];
    matchingSelected.forEach(selected => {
        if (!allSuggestions.some(s => s.displayName.toLowerCase() === selected.displayName.toLowerCase())) {
            // Convert to TagData shape if needed (TagData has id, usageCount etc which might be missing on selected)
            allSuggestions.push({
                id: selected.id || `temp-${selected.displayName}`,
                displayName: selected.displayName,
                category: selected.category || category,
                usageCount: 0 // Local/Selected tags might not have usage count known
            });
        }
    });

    return (
        <div className={cn("space-y-3", className)} ref={dropdownRef}>
            {/* Input ... (same) */}
            <div className="relative">
                <div className="relative flex items-center">
                    {category === 'author' ? (
                        <CircleUser size={14} className="absolute left-3 text-cyan-400 pointer-events-none" />
                    ) : (
                        <Search size={14} className="absolute left-3 text-textMuted pointer-events-none" />
                    )}
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setIsOpen(true);
                        }}
                        onFocus={() => setIsOpen(true)}
                        onKeyDown={handleKeyDown}
                        className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white outline-none focus:border-primary placeholder:text-white/30 transition-colors"
                        placeholder={placeholder || t('searchOrAddTags')}
                        maxLength={25}
                    />
                    {isLoading && (
                        <div className="absolute right-3">
                            <div className="w-4 h-4 border-2 border-white/20 border-t-primary rounded-full animate-spin" />
                        </div>
                    )}
                </div>

                {/* Dropdown */}
                {isOpen && (query.length > 0 || popularTags.length > 0) && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-white/10 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
                        {/* Search results - horizontal pill layout like Popular Tags */}
                        {query && allSuggestions.length > 0 && (
                            <div className="p-2 border-b border-white/5">
                                <div className="text-[10px] uppercase tracking-wider text-textMuted mb-2 px-1">
                                    {t('suggestions')}
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {allSuggestions.map(tag => {
                                        const selected = isSelected(tag.displayName);
                                        return (
                                            <span
                                                key={tag.id || tag.displayName}
                                                onClick={() => toggleTag(tag.displayName)}
                                                className={cn(
                                                    "cursor-pointer transition-all hover:scale-105 active:scale-95 inline-flex items-center gap-1",
                                                    selected && "ring-1 ring-primary/50 rounded-md"
                                                )}
                                            >
                                                <Tag
                                                    category={tag.category || category}
                                                    color={tag.color || undefined}
                                                >
                                                    {tag.displayName} ({tag.usageCount ?? 0})
                                                </Tag>
                                                {selected && <Check size={10} className="text-primary -ml-1" />}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Create new tag option */}
                        {query && !allSuggestions.some(s => s.displayName.toLowerCase() === query.toLowerCase()) && !isSelected(query) && (
                            <button
                                onClick={() => addTag(query)}
                                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 text-left transition-colors border-b border-white/5"
                            >
                                <Plus size={14} className="text-primary" />
                                <span className="text-sm text-white">
                                    {t('createTag')} "<span className="text-primary">{query}</span>"
                                </span>
                            </button>
                        )}

                        {/* Popular tags - filtered to exclude already selected */}
                        {!query && popularTags.filter(p => !isSelected(p.displayName)).length > 0 && (
                            <div className="p-2">
                                <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-textMuted mb-2 px-1">
                                    <TrendingUp size={10} />
                                    {t('popularTags')}
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {popularTags.filter(p => !isSelected(p.displayName)).slice(0, 6).map(tag => (
                                        <span
                                            key={tag.id}
                                            onClick={() => addTag(tag.displayName)}
                                            className="cursor-pointer transition-all hover:scale-105 active:scale-95"
                                        >
                                            <Tag
                                                category={tag.category || category}
                                                color={tag.color || undefined}
                                            >
                                                {tag.displayName} ({tag.usageCount ?? 0})
                                            </Tag>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* No results */}
                        {query && suggestions.length === 0 && !isLoading && (
                            <div className="p-3 text-center text-sm text-textMuted">
                                {t('noTagsFound')}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Selected tags */}
            {!hideSelectedTags && selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {selectedTags
                        .filter(t => t.category === category || !t.category)
                        .sort((a, b) => a.displayName.localeCompare(b.displayName))
                        .map(tag => (
                            <span
                                key={tag.displayName}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[12px] font-bold transition-colors hover:brightness-110"
                                style={(() => {
                                    const tagColor = tag.color || (category === 'author' ? '#22d3ee' : null);
                                    return tagColor ? {
                                        color: tagColor,
                                        backgroundColor: `${tagColor}1a`,
                                        borderColor: `${tagColor}33`
                                    } : {
                                        color: '#a1a1aa',
                                        backgroundColor: 'rgba(161, 161, 170, 0.1)',
                                        borderColor: 'rgba(161, 161, 170, 0.2)'
                                    };
                                })()}
                            >
                                {category === 'author' && <CircleUser size={14} />}
                                {tag.displayName}
                                <button
                                    type="button"
                                    onClick={() => removeTag(tag.displayName)}
                                    className="text-current opacity-60 hover:opacity-100 hover:text-red-400 transition-all ml-0.5"
                                >
                                    <X size={14} />
                                </button>
                            </span>
                        ))}
                </div>
            )}
        </div>
    );
}
