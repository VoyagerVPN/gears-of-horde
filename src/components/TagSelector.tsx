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
    const [debouncedQuery, setDebouncedQuery] = useState('');
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
        if (!query.trim()) {
            setDebouncedQuery('');
            setSuggestions([]);
            return;
        }

        const timer = setTimeout(() => {
            setDebouncedQuery(query);
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
        setDebouncedQuery('');
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
        <div className={cn("space-y-2", className)} ref={dropdownRef}>
            {/* Input ... (same) */}
            <div className="relative">
                <div className="relative flex items-center">
                    {category === 'author' ? (
                        <CircleUser size={14} className="absolute left-3 text-cyan-400 pointer-events-none" />
                    ) : (
                        <Search size={14} className="absolute left-3 text-textMuted pointer-events-none" />
                    )}
                    <input
                        id={`tag-input-${category}`}
                        name={`tag-input-${category}`}
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setIsOpen(true);
                        }}
                        onFocus={() => setIsOpen(true)}
                        onKeyDown={handleKeyDown}
                        className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white outline-none hover:border-white/20 focus:border-white/30 placeholder:text-white/30 transition-colors"
                        placeholder={placeholder || t('searchOrAddTags')}
                        maxLength={25}
                        spellCheck={false}
                    />
                    {/* removed isLoading spinner */}
                </div>

                {/* Dropdown */}
                {isOpen && (query.length > 0 || popularTags.length > 0) && (
                    <div className="absolute top-full left-0 mt-1 bg-zinc-900 border border-white/10 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto overflow-x-hidden min-w-[280px]">
                        {/* 1. Immediate Action: Create Tag */}
                        {query && !isSelected(query) && (
                            <button
                                onClick={() => addTag(query)}
                                className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-white/5 text-left transition-colors font-bold border-b border-white/5"
                            >
                                <Plus size={14} className="text-primary" />
                                <span className="text-sm text-white">
                                    {t('createTag')} "<span className="text-primary truncate max-w-[200px] inline-block align-bottom">{query}</span>"
                                </span>
                            </button>
                        )}

                        {/* 2. Suggestions Section - Stable Layout */}
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
                                                        value={tag.category === 'author' ? 'author' : undefined}
                                                        color={tag.color || undefined}
                                                        showIcon={true}
                                                        className={selected ? "!border-primary" : ""}
                                                        onContentClick={() => toggleTag(tag.displayName)}
                                                        actions={[{
                                                            icon: <span className="opacity-80">({count})</span>,
                                                            onClick: () => toggleTag(tag.displayName),
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
                                    ) : (
                                        debouncedQuery === query && (
                                            <div className="w-full py-4 text-center text-sm text-textMuted italic">
                                                {t('noTagsFound')}
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        )}

                        {/* 3. Popular tags - only if not searching */}
                        {!query && popularTags.filter(p => !isSelected(p.displayName)).length > 0 && (
                            <div className="p-2">
                                <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-textMuted mb-2 px-1">
                                    <TrendingUp size={10} />
                                    {t('popularTags')}
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {popularTags.filter(p => !isSelected(p.displayName)).slice(0, 6).map(tag => (
                                        <div
                                            key={tag.id}
                                            className="cursor-pointer"
                                        >
                                            <Tag
                                                category={tag.category || category}
                                                value={tag.category === 'author' ? 'author' : undefined}
                                                color={tag.color || undefined}
                                                showIcon={true}
                                                onContentClick={() => addTag(tag.displayName)}
                                                actions={[{
                                                    icon: <span className="opacity-80">({tag.usageCount ?? 0})</span>,
                                                    onClick: () => addTag(tag.displayName),
                                                    variant: 'transparent'
                                                }]}
                                            >
                                                {tag.displayName}
                                            </Tag>
                                        </div>
                                    ))}
                                </div>
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
                            <Tag
                                key={tag.displayName}
                                category={tag.category || category}
                                value={tag.category === 'author' ? 'author' : undefined}
                                color={tag.color || undefined}
                                showIcon={true}
                                onRemove={() => removeTag(tag.displayName)}
                            >
                                {tag.displayName}
                            </Tag>
                        ))}
                </div>
            )}
        </div>
    );
}
