"use client";

import { Search, X, TrendingUp } from "lucide-react";
import { useState, useRef, useEffect, useCallback, ChangeEvent, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { searchTags, fetchPopularTags, TagData } from "@/app/actions/tag-actions";
import Tag from "@/components/ui/Tag";
import { useTranslations } from "next-intl";

interface SearchBarProps {
    /** For controlled mode - current value */
    value?: string;
    /** For controlled mode - change handler */
    onChange?: (value: string) => void;
    /** Placeholder text */
    placeholder?: string;
    /** Visual variant - 'default' or 'compact' */
    variant?: 'default' | 'compact';
    /** Additional CSS classes for the container */
    className?: string;
    /** Enable tag autocomplete dropdown */
    showTagSuggestions?: boolean;
    /** Current locale for navigation */
    locale?: string;
}

/**
 * Unified SearchBar Component with optional tag autocomplete
 */
export default function SearchBar({
    value,
    onChange,
    placeholder = "Search...",
    variant = 'default',
    className,
    showTagSuggestions = false,
    locale = 'en',
}: SearchBarProps) {
    const t = useTranslations('Common');
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // For uncontrolled mode
    const [internalValue, setInternalValue] = useState("");
    const [suggestions, setSuggestions] = useState<TagData[]>([]);
    const [popularTags, setPopularTags] = useState<TagData[]>([]);
    const [selectedTags, setSelectedTags] = useState<TagData[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [highlightIndex, setHighlightIndex] = useState(-1);

    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : internalValue;

    // Fetch popular tags on mount if suggestions enabled
    useEffect(() => {
        if (showTagSuggestions) {
            fetchPopularTags(6).then(tags => {
                setPopularTags(tags.filter(t => t.category === 'tag'));
            });
        }
    }, [showTagSuggestions]);

    // Search tags as user types
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

    // Debounce search
    useEffect(() => {
        if (!showTagSuggestions) return;
        const timer = setTimeout(() => {
            handleSearch(currentValue);
        }, 200);
        return () => clearTimeout(timer);
    }, [currentValue, handleSearch, showTagSuggestions]);

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

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        if (isControlled && onChange) {
            onChange(newValue);
        } else {
            setInternalValue(newValue);
        }
        if (showTagSuggestions) {
            setIsOpen(true);
        }
    };

    const handleClear = () => {
        if (isControlled && onChange) {
            onChange("");
        } else {
            setInternalValue("");
        }
        setSelectedTags([]);
        setSuggestions([]);
        setIsOpen(false);
        inputRef.current?.focus();
    };

    const selectTag = (tag: TagData) => {
        // Add to selected tags if not already selected
        if (!selectedTags.some(t => t.displayName.toLowerCase() === tag.displayName.toLowerCase())) {
            setSelectedTags([...selectedTags, tag]);
        }
        // Clear input
        if (isControlled && onChange) {
            onChange("");
        } else {
            setInternalValue("");
        }
        setSuggestions([]);
        setIsOpen(false);
        inputRef.current?.focus();
    };

    const removeTag = (tagName: string) => {
        setSelectedTags(selectedTags.filter(t => t.displayName !== tagName));
    };

    const performSearch = () => {
        const tagParams = selectedTags.map(t => `tag=${encodeURIComponent(t.displayName)}`).join('&');
        const query = currentValue.trim();
        const queryParam = query ? `q=${encodeURIComponent(query)}` : '';
        const params = [queryParam, tagParams].filter(Boolean).join('&');

        if (params) {
            router.push(`/${locale}/search?${params}`);
            // Clear after navigation
            setSelectedTags([]);
            if (isControlled && onChange) {
                onChange("");
            } else {
                setInternalValue("");
            }
            setIsOpen(false);
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Escape") {
            setIsOpen(false);
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (showTagSuggestions && isOpen && highlightIndex >= 0) {
                // Add highlighted tag to selection
                const allItems = suggestions.length > 0 ? suggestions : popularTags;
                if (highlightIndex < allItems.length) {
                    selectTag(allItems[highlightIndex]);
                }
            } else {
                // Perform search with current text + selected tags
                performSearch();
            }
        } else if (e.key === "Backspace" && !currentValue && selectedTags.length > 0) {
            // Remove last tag on backspace when input is empty
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
        <div
            ref={dropdownRef}
            className={className}
            style={{
                position: 'relative',
                flex: '1 1 0%',
                width: '100%',
                maxWidth: '448px'
            }}
        >
            {/* Input container with selected tags */}
            <div
                className="flex items-center gap-1 flex-wrap"
                style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    paddingLeft: '40px',
                    paddingRight: selectedTags.length > 0 || currentValue ? '40px' : '12px',
                    paddingTop: '6px',
                    paddingBottom: '6px',
                    minHeight: '38px',
                }}
            >
                <Search
                    className="text-textMuted pointer-events-none"
                    style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '16px',
                        height: '16px',
                        zIndex: 1
                    }}
                />

                {/* Selected tags chips */}
                {selectedTags.map(tag => (
                    <span
                        key={tag.displayName}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs shrink-0"
                        style={{
                            backgroundColor: tag.color ? `${tag.color}20` : 'rgba(161, 161, 170, 0.15)',
                            border: `1px solid ${tag.color || '#71717a'}40`,
                            color: tag.color || '#a1a1aa'
                        }}
                    >
                        {tag.displayName}
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeTag(tag.displayName); }}
                            className="opacity-60 hover:opacity-100 hover:text-red-400 transition-all"
                        >
                            <X size={10} />
                        </button>
                    </span>
                ))}

                {/* Input field */}
                <input
                    ref={inputRef}
                    type="text"
                    value={currentValue}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => showTagSuggestions && setIsOpen(true)}
                    placeholder={selectedTags.length > 0 ? '' : placeholder}
                    className="flex-1 min-w-[80px] bg-transparent outline-none text-sm text-white placeholder:text-white/30"
                />
            </div>

            {/* Clear button */}
            {(currentValue || selectedTags.length > 0) && (
                <button
                    type="button"
                    onClick={handleClear}
                    className="text-textMuted hover:text-white transition-colors"
                    style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        zIndex: 1
                    }}
                    aria-label="Clear search"
                >
                    <X size={14} />
                </button>
            )}
            {isLoading && (
                <div style={{
                    position: 'absolute',
                    right: currentValue ? '36px' : '12px',
                    top: '50%',
                    transform: 'translateY(-50%)'
                }}>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-primary rounded-full animate-spin" />
                </div>
            )}

            {/* Tag suggestions dropdown */}
            {shouldShowDropdown && (
                <div
                    className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-white/10 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto"
                >
                    {/* Search results */}
                    {suggestions.length > 0 && (
                        <div className="p-2">
                            <div className="text-[10px] uppercase tracking-wider text-textMuted mb-2 px-1">
                                {t('suggestions')}
                            </div>
                            {suggestions.map((tag, idx) => (
                                <button
                                    key={tag.id}
                                    onClick={() => selectTag(tag)}
                                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left transition-colors ${idx === highlightIndex ? 'bg-white/10' : 'hover:bg-white/5'
                                        }`}
                                >
                                    <Tag color={tag.color || undefined} className="text-xs">
                                        {tag.displayName}
                                    </Tag>
                                    <span className="text-[10px] text-textMuted ml-auto">
                                        {tag.usageCount} {t('mods')}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Popular tags when no search */}
                    {currentValue.length < 2 && popularTags.length > 0 && suggestions.length === 0 && (
                        <div className="p-2">
                            <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-textMuted mb-2 px-1">
                                <TrendingUp size={10} />
                                {t('popularTags')}
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {popularTags.map((tag, idx) => (
                                    <button
                                        key={tag.id}
                                        onClick={() => selectTag(tag)}
                                        className={`transition-transform hover:scale-105 active:scale-95 ${idx === highlightIndex ? 'ring-1 ring-primary' : ''
                                            }`}
                                    >
                                        <Tag color={tag.color || undefined} className="text-xs cursor-pointer hover:opacity-80">
                                            {tag.displayName}
                                        </Tag>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
