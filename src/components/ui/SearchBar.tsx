"use client";

import { Search, X, TrendingUp } from "lucide-react";
import { useState, useRef, useEffect, useCallback, ChangeEvent, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { searchTags, fetchPopularTags, TagData } from "@/app/actions/tag-actions";
import Tag from "@/components/ui/Tag";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface SearchBarProps {
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    variant?: 'default' | 'compact';
    className?: string;
    showTagSuggestions?: boolean;
    locale?: string;
}

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
    const tA11y = useTranslations('Accessibility');
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
        if (!selectedTags.some(t => t.displayName.toLowerCase() === tag.displayName.toLowerCase())) {
            setSelectedTags([...selectedTags, tag]);
        }
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
                const allItems = suggestions.length > 0 ? suggestions : popularTags;
                if (highlightIndex < allItems.length) {
                    selectTag(allItems[highlightIndex]);
                }
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
        <div
            ref={dropdownRef}
            className={cn("w-full relative group", className)}
        >
            {/* Input Container */}
            <div className="flex items-center gap-3 bg-background/50 border border-white/10 rounded-lg px-3 py-1.5 min-h-[38px] focus-within:border-white/20 focus-within:bg-background transition-all hover:bg-background/80 overflow-hidden w-full">
                <Search className="w-5 h-5 text-textMuted shrink-0" aria-hidden="true" />

                {/* Input */}
                <input
                    ref={inputRef}
                    type="text"
                    value={currentValue}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => showTagSuggestions && setIsOpen(true)}
                    placeholder={placeholder}
                    className="flex-grow bg-transparent border-none outline-none text-sm text-foreground placeholder:text-textMuted/50 h-full min-w-[80px]"
                />

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                    {(currentValue || selectedTags.length > 0) && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="text-textMuted hover:text-foreground transition-colors p-1"
                        >
                            <X size={14} />
                        </button>
                    )}
                    {isLoading && (
                        <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    )}
                </div>
            </div>

            {/* Selected Tags - Below Search Bar */}
            {selectedTags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap mt-3">
                    {selectedTags.map(tag => (
                        <span
                            key={tag.displayName}
                            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs bg-white/5 border border-white/10 animate-in fade-in zoom-in-95 duration-200"
                        >
                            <span style={{ color: tag.color || '#a1a1aa' }}>{tag.displayName}</span>
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); removeTag(tag.displayName); }}
                                className="text-textMuted hover:text-red-400 transition-colors"
                            >
                                <X size={10} aria-hidden="true" />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {/* Dropdown */}
            {shouldShowDropdown && (
                <div
                    className="absolute top-full left-0 right-0 mt-2 bg-background border border-white/10 rounded-lg shadow-2xl z-50 overflow-hidden backdrop-blur-xl"
                >
                    {suggestions.length > 0 ? (
                        <div className="p-2 space-y-1">
                            <div className="text-[10px] uppercase tracking-wider text-textMuted px-2 py-1 font-semibold">
                                {t('suggestions')}
                            </div>
                            {suggestions.map((tag, idx) => (
                                <button
                                    key={tag.id}
                                    onClick={() => selectTag(tag)}
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
                                        onClick={() => selectTag(tag)}
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
            )}
        </div>
    );
}
