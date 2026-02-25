"use client";

import { Search, CircleUser } from "lucide-react";
import { cn } from "@/lib/utils";
import { INVALID_INPUT_STYLE } from "@/lib/constants/ui-constants";
import { useTranslations } from "next-intl";

interface TagSearchInputProps {
    query: string;
    onChange: (value: string) => void;
    onFocus: () => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    category: string;
    compact?: boolean;
    invalid?: boolean;
    onClear?: () => void;
    inputRef: React.RefObject<HTMLInputElement | null>;
}

export default function TagSearchInput({
    query,
    onChange,
    onFocus,
    onKeyDown,
    category,
    compact = false,
    invalid,
    onClear,
    inputRef
}: TagSearchInputProps) {
    const t = useTranslations('Common');

    return (
        <div
            className={cn(
                "flex flex-wrap items-center border rounded-md transition-all",
                compact ? "gap-1 px-2 py-1 bg-white/5" : "gap-2 px-3 py-1.5 bg-black/40 min-h-[38px]",
                invalid ? INVALID_INPUT_STYLE : "border-white/10 hover:border-white/20 focus-within:border-white/30"
            )}
            onClick={() => {
                inputRef.current?.focus();
                onClear?.();
            }}
        >
            {category === 'author' ? (
                <CircleUser size={14} className="text-cyan-400 pointer-events-none" />
            ) : (
                <Search size={14} className="text-textMuted pointer-events-none" />
            )}
            <input
                ref={inputRef}
                id={`tag-input-${category}`}
                name={`tag-input-${category}`}
                type="text"
                value={query}
                onChange={(e) => {
                    onChange(e.target.value);
                    onClear?.();
                }}
                onFocus={() => {
                    onFocus();
                    onClear?.();
                }}
                onKeyDown={onKeyDown}
                className={cn(
                    "flex-1 bg-transparent border-none outline-none text-white p-0",
                    compact ? "text-xs min-w-[40px] h-5" : "text-sm min-w-[120px] h-7"
                )}
                placeholder={t('searchOrAddTags')}
                maxLength={25}
                spellCheck={false}
            />
        </div>
    );
}
