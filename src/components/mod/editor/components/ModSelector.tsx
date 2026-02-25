"use client";

import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { ModSelectorItem } from "@/app/actions/search-actions";
import { useTranslations } from "next-intl";
import { DialogField, dialogInputClass } from "@/shared/ui";

interface ModSelectorProps {
    value: string;
    onSelect: (mod: ModSelectorItem) => void;
    searchMods: (query: string) => Promise<ModSelectorItem[]>;
}

export default function ModSelector({ value, onSelect, searchMods }: ModSelectorProps) {
    const t = useTranslations('UnifiedUpdateModal');
    const [query, setQuery] = useState(value);
    const [results, setResults] = useState<ModSelectorItem[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const timer = setTimeout(async () => {
            const searchResults = await searchMods(query.trim());
            setResults(searchResults);
        }, 300);
        return () => clearTimeout(timer);
    }, [query, searchMods]);

    const handleSelect = (mod: ModSelectorItem) => {
        onSelect(mod);
        setQuery(mod.title);
        setIsOpen(false);
    };

    return (
        <DialogField label={t("modName")} smallLabel>
            <div className="relative group">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted group-focus-within:text-white transition-colors" size={16} />
                    <input
                        ref={inputRef}
                        className={`${dialogInputClass} pl-10 cursor-text`}
                        placeholder={t("searchMod")}
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setIsOpen(true);
                        }}
                        onFocus={() => setIsOpen(true)}
                        autoComplete="off"
                    />
                </div>
                {isOpen && results.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                        {results.map(m => (
                            <button
                                key={m.id}
                                onClick={() => handleSelect(m)}
                                className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 cursor-pointer"
                            >
                                <div className="font-bold text-white">{m.title}</div>
                            </button>
                        ))}
                    </div>
                )}
                {isOpen && (
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                )}
            </div>
        </DialogField>
    );
}
