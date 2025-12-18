"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Plus, Tag as TagIcon, TrendingUp } from 'lucide-react';
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
}

export default function TagSelector({
    selectedTags,
    onTagsChange,
    category = 'tag',
    placeholder,
    showPopular = true,
    maxTags,
    className
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
            fetchPopularTags(8).then(tags => {
                // Filter to only show 'tag' category and exclude already selected
                setPopularTags(tags.filter(t => t.category === category));
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
            // Filter out already selected tags
            const filtered = results.filter(
                r => !selectedTags.some(s => s.displayName.toLowerCase() === r.displayName.toLowerCase())
            );
            setSuggestions(filtered);
        } catch (error) {
            console.error('Error searching tags:', error);
            setSuggestions([]);
        } finally {
            setIsLoading(false);
        }
    }, [category, selectedTags]);

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

    const addTag = (tagName: string) => {
        if (!tagName.trim()) return;
        if (maxTags && selectedTags.length >= maxTags) return;
        if (selectedTags.some(t => t.displayName.toLowerCase() === tagName.toLowerCase())) return;

        onTagsChange([...selectedTags.map(t => ({ displayName: t.displayName, category: t.category || category })), { displayName: tagName.trim(), category }]);
        setQuery('');
        setSuggestions([]);
        setIsOpen(false);
    };

    const removeTag = (tagName: string) => {
        onTagsChange(selectedTags.filter(t => t.displayName !== tagName).map(t => ({ displayName: t.displayName, category: t.category || category })));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            // If there's a suggestion highlighted or query matches, add it
            if (suggestions.length > 0) {
                addTag(suggestions[0].displayName);
            } else if (query.trim()) {
                addTag(query);
            }
        } else if (e.key === 'Escape') {
            setIsOpen(false);
            setQuery('');
        } else if (e.key === 'Backspace' && !query && selectedTags.length > 0) {
            // Remove last tag if backspace on empty input
            removeTag(selectedTags[selectedTags.length - 1].displayName);
        }
    };

    // Available popular tags (not already selected)
    const availablePopular = popularTags.filter(
        p => !selectedTags.some(s => s.displayName.toLowerCase() === p.displayName.toLowerCase())
    );

    return (
        <div className={cn("space-y-3", className)} ref={dropdownRef}>
            {/* Input with dropdown */}
            <div className="relative">
                <div className="relative flex items-center">
                    <Search size={14} className="absolute left-3 text-textMuted pointer-events-none" />
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
                    />
                    {isLoading && (
                        <div className="absolute right-3">
                            <div className="w-4 h-4 border-2 border-white/20 border-t-primary rounded-full animate-spin" />
                        </div>
                    )}
                </div>

                {/* Dropdown */}
                {isOpen && (query.length > 0 || availablePopular.length > 0) && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-white/10 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
                        {/* Search results */}
                        {query && suggestions.length > 0 && (
                            <div className="p-2 border-b border-white/5">
                                <div className="text-[10px] uppercase tracking-wider text-textMuted mb-2 px-1">
                                    {t('suggestions')}
                                </div>
                                {suggestions.map(tag => (
                                    <button
                                        key={tag.id}
                                        onClick={() => addTag(tag.displayName)}
                                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/5 text-left transition-colors group"
                                    >
                                        <Tag color={tag.color || undefined} className="text-xs">
                                            {tag.displayName}
                                        </Tag>
                                        <span className="text-[10px] text-textMuted">
                                            {tag.usageCount} {t('mods')}
                                        </span>
                                        <Plus size={12} className="ml-auto text-textMuted group-hover:text-primary transition-colors" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Create new tag option */}
                        {query && !suggestions.some(s => s.displayName.toLowerCase() === query.toLowerCase()) && (
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

                        {/* Popular tags */}
                        {!query && availablePopular.length > 0 && (
                            <div className="p-2">
                                <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-textMuted mb-2 px-1">
                                    <TrendingUp size={10} />
                                    {t('popularTags')}
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {availablePopular.slice(0, 6).map(tag => (
                                        <button
                                            key={tag.id}
                                            onClick={() => addTag(tag.displayName)}
                                            className="transition-transform hover:scale-105 active:scale-95"
                                        >
                                            <Tag color={tag.color || undefined} className="text-xs cursor-pointer hover:opacity-80">
                                                {tag.displayName}
                                            </Tag>
                                        </button>
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
            {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {selectedTags.filter(t => t.category === category || !t.category).map(tag => (
                        <span
                            key={tag.displayName}
                            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-xs"
                            style={(() => {
                                // Author tags always use blue
                                const tagColor = tag.color || (category === 'author' ? '#3b82f6' : null);
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
                            {tag.displayName}
                            <button
                                type="button"
                                onClick={() => removeTag(tag.displayName)}
                                className="text-current opacity-60 hover:opacity-100 hover:text-red-400 transition-all"
                            >
                                <X size={12} />
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}
