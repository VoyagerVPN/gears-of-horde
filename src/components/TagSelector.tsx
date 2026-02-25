"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { searchTags, fetchPopularTags, TagData } from '@/app/actions/tag-actions';
import { cn } from '@/lib/utils';

import TagSearchInput from './ui/search/TagSearchInput';
import TagSuggestions from './ui/search/TagSuggestions';
import PopularTags from './ui/search/PopularTags';
import SelectedTags from './ui/search/SelectedTags';

interface TagSelectorProps {
    selectedTags: Array<{ displayName: string; category?: string; id?: string; color?: string | null; value?: string }>;
    onTagsChange: (tags: Array<{ displayName: string; category: string }>) => void;
    category?: string;
    placeholder?: string;
    showPopular?: boolean;
    maxTags?: number;
    className?: string;
    hideSelectedTags?: boolean;
    invalid?: boolean;
    onClear?: () => void;
    compact?: boolean;
}

export default function TagSelector({
    selectedTags,
    onTagsChange,
    category = 'tag',
    showPopular = true,
    maxTags,
    className,
    hideSelectedTags = false,
    invalid,
    onClear,
    compact = false
}: TagSelectorProps) {
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
            fetchPopularTags(8, category).then(setPopularTags);
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

    return (
        <div className={cn("space-y-2", className)} ref={dropdownRef}>
            <TagSearchInput
                query={query}
                onChange={setQuery}
                onFocus={() => setIsOpen(true)}
                onKeyDown={handleKeyDown}
                category={category}
                compact={compact}
                invalid={invalid}
                onClear={onClear}
                inputRef={inputRef}
            />

            {/* Dropdown */}
            {isOpen && (query.length > 0 || (showPopular && popularTags.length > 0)) && (
                <div className="absolute top-full left-0 mt-1 bg-zinc-900 border border-white/10 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto overflow-x-hidden min-w-[280px]">
                    <TagSuggestions
                        query={query}
                        suggestions={suggestions}
                        selectedTags={selectedTags}
                        category={category}
                        isLoading={isLoading}
                        isSearching={debouncedQuery === query}
                        onAdd={addTag}
                        onToggle={toggleTag}
                    />

                    {!query && (
                        <PopularTags
                            tags={popularTags}
                            selectedTags={selectedTags}
                            category={category}
                            onAdd={addTag}
                        />
                    )}
                </div>
            )}

            {!hideSelectedTags && (
                <SelectedTags
                    tags={selectedTags}
                    category={category}
                    onRemove={removeTag}
                />
            )}
        </div>
    );
}
