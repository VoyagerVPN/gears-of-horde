"use client";

import { useState, useRef, useEffect, useCallback, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { searchTags, fetchPopularTags, TagData } from '@/app/actions/tag-actions';
import { cn } from "@/lib/utils";

import SearchInput from "./search/SearchInput";
import SelectedSearchTags from "./search/SelectedSearchTags";
import SearchDropdown from "./search/SearchDropdown";

interface SearchBarProps {
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    className?: string;
    showTagSuggestions?: boolean;
    locale?: string;
    variant?: 'default' | 'compact'; // Deprecated: kept for backward compatibility
}

export default function SearchBar({
    value,
    onChange,
    placeholder = "Search...",
    className,
    showTagSuggestions = false,
    locale = 'en',
    variant: _variant, // Deprecated: kept for backward compatibility, will be removed in v2
}: SearchBarProps) {
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [internalValue, setInternalValue] = useState("");
    const [suggestions, setSuggestions] = useState<TagData[]>([]);
    const [popularTags, setPopularTags] = useState<TagData[]>([]);
    const [selectedTags, setSelectedTags] = useState<TagData[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [highlightIndex, setHighlightIndex] = useState(-1);

    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : internalValue;

    // Fetch popular tags
    useEffect(() => {
        if (showTagSuggestions) {
            fetchPopularTags(6).then(tags => {
                setPopularTags(tags.filter(t => t.category === 'tag'));
            });
        }
    }, [showTagSuggestions]);

    // Search tags
    const handleSearch = useCallback(async (searchQuery: string) => {
        if (!showTagSuggestions || searchQuery.length < 2) {
            setSuggestions([]);
            return;
        }
        setIsLoading(true);
        try {
            const results = await searchTags(searchQuery, 'tag', 5);
            setSuggestions(results);
            setHighlightIndex(-1);
        } catch (error) {
            console.error('Error searching tags:', error);
            setSuggestions([]);
        } finally {
            setIsLoading(false);
        }
    }, [showTagSuggestions]);

    // Debounce
    useEffect(() => {
        if (!showTagSuggestions) return;
        const timer = setTimeout(() => handleSearch(currentValue), 200);
        return () => clearTimeout(timer);
    }, [currentValue, handleSearch, showTagSuggestions]);

    // Click outside
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const updateValue = (newValue: string) => {
        if (isControlled && onChange) {
            onChange(newValue);
        } else {
            setInternalValue(newValue);
        }
    };

    const handleClear = () => {
        updateValue("");
        setSelectedTags([]);
        setSuggestions([]);
        setIsOpen(false);
        inputRef.current?.focus();
    };

    const selectTag = (tag: TagData) => {
        if (!selectedTags.some(t => t.displayName.toLowerCase() === tag.displayName.toLowerCase())) {
            setSelectedTags([...selectedTags, tag]);
        }
        updateValue("");
        setSuggestions([]);
        setIsOpen(false);
        inputRef.current?.focus();
    };

    const removeTag = (tagName: string) => {
        setSelectedTags(selectedTags.filter(t => t.displayName !== tagName));
    };

    const performSearch = () => {
        const params = new URLSearchParams();
        if (currentValue.trim()) params.set('q', currentValue.trim());
        if (selectedTags.length > 0) {
            params.set('tags', selectedTags.map(t => t.displayName).join(','));
        }
        if (params.toString()) {
            router.push(`/${locale}/mods?${params.toString()}`);
            setIsOpen(false);
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Escape") {
            setIsOpen(false);
        } else if (e.key === "Enter") {
            e.preventDefault();
            const allItems = suggestions.length > 0 ? suggestions : popularTags;
            if (showTagSuggestions && isOpen && highlightIndex >= 0 && highlightIndex < allItems.length) {
                selectTag(allItems[highlightIndex]);
            } else {
                performSearch();
            }
        } else if (e.key === "Backspace" && !currentValue && selectedTags.length > 0) {
            removeTag(selectedTags[selectedTags.length - 1].displayName);
        } else if (showTagSuggestions && isOpen) {
            const allItems = suggestions.length > 0 ? suggestions : popularTags;
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setHighlightIndex(prev => (prev < allItems.length - 1 ? prev + 1 : 0));
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setHighlightIndex(prev => (prev > 0 ? prev - 1 : allItems.length - 1));
            }
        }
    };

    const shouldShowDropdown = showTagSuggestions && isOpen && (suggestions.length > 0 || (currentValue.length < 2 && popularTags.length > 0));

    return (
        <div ref={dropdownRef} className={cn("w-full relative group", className)}>
            <SearchInput
                value={currentValue}
                onChange={updateValue}
                onClear={handleClear}
                onFocus={() => showTagSuggestions && setIsOpen(true)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                inputRef={inputRef}
                isLoading={isLoading}
            />

            <SelectedSearchTags tags={selectedTags} onRemove={removeTag} />

            {shouldShowDropdown && (
                <SearchDropdown
                    suggestions={suggestions}
                    popularTags={popularTags}
                    highlightIndex={highlightIndex}
                    onSelectTag={selectTag}
                />
            )}
        </div>
    );
}
