"use client";

import { Search, X } from "lucide-react";

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    onClear: () => void;
    onFocus: () => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    placeholder?: string;
    inputRef: React.RefObject<HTMLInputElement | null>;
    isLoading?: boolean;
}

export default function SearchInput({
    value,
    onChange,
    onClear,
    onFocus,
    onKeyDown,
    placeholder = "Search...",
    inputRef,
    isLoading
}: SearchInputProps) {
    return (
        <div className="flex items-center gap-3 bg-background/50 border border-white/10 rounded-lg px-3 py-1.5 min-h-[38px] focus-within:border-white/20 focus-within:bg-background transition-all hover:bg-background/80 overflow-hidden w-full">
            <Search className="w-5 h-5 text-textMuted shrink-0" aria-hidden="true" />

            <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={onKeyDown}
                onFocus={onFocus}
                placeholder={placeholder}
                className="flex-grow bg-transparent border-none outline-none text-sm text-foreground placeholder:text-textMuted/50 h-full min-w-[80px]"
            />

            <div className="flex items-center gap-2 shrink-0">
                {value && (
                    <button
                        type="button"
                        onClick={onClear}
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
    );
}
