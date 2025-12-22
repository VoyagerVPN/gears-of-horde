"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Clock, Flame, Star, ArrowUpDown, ChevronDown, Check } from "lucide-react";
import { useCallback, useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";

type SortOption = 'updated' | 'rating' | 'downloads' | 'views';
type SortDir = 'asc' | 'desc';

export default function SortToolbar() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    // Using a simpler client-side translation or just hardcoded for now if setup is complex,
    // but the project uses next-intl so I should try to use it if I can hook it up easily.
    // However, for Client Components in app dir, one usually passes translations as props or uses the provider.
    // I'll stick to English/Map for simplicity unless I see easy i18n usage pattern.
    // The previous file used `await getTranslations`, so it's server-side mostly.
    // I'll leave text hardcoded or use a simple map for now to avoid hook issues, 
    // or assume `NextIntlClientProvider` is wrapped around the app.
    // Actually, let's just use English for the labels for now to ensure it works.

    const currentSort = (searchParams.get('sort') as SortOption) || 'updated';
    const currentDir = (searchParams.get('dir') as SortDir) || 'desc';

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleSort = useCallback((sort: SortOption) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('sort', sort);
        // Default to desc for most metrics
        if (!params.has('dir')) {
            params.set('dir', 'desc');
        }
        router.push(pathname + '?' + params.toString());
    }, [pathname, router, searchParams]);

    const handleDir = useCallback((dir: SortDir) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('dir', dir);
        router.push(pathname + '?' + params.toString());
    }, [pathname, router, searchParams]);

    // Close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const buttons = [
        { key: 'updated', label: 'Updated', icon: Clock },
        { key: 'downloads', label: 'Featured', icon: Flame }, // Mapping Featured to Downloads
        { key: 'rating', label: 'Top Rated', icon: Star },
    ];

    const dropdownOptions: { key: SortOption, label: string }[] = [
        { key: 'updated', label: 'Date Updated' },
        { key: 'rating', label: 'Rating' },
        { key: 'downloads', label: 'Downloads' },
        { key: 'views', label: 'Views' },
    ];

    return (
        <div className="flex items-center justify-between bg-surface/50 backdrop-blur-sm p-1.5 rounded-lg border border-white/5">
            {/* Quick Buttons */}
            <div className="flex gap-1">
                {buttons.map((btn) => {
                    const isActive = currentSort === btn.key;
                    return (
                        <button
                            key={btn.key}
                            onClick={() => handleSort(btn.key as SortOption)}
                            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-md transition-colors uppercase tracking-wide
                                ${isActive
                                    ? 'bg-white/10 text-white'
                                    : 'text-textMuted hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <btn.icon size={14} />
                            {btn.label}
                        </button>
                    );
                })}
            </div>

            {/* Dropdown System */}
            <div className="relative" ref={dropdownRef}>
                <div className="flex items-center px-2">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-2 text-primary hover:text-white transition-colors p-1"
                        title="Sort Options"
                    >
                        <ArrowUpDown size={18} />
                    </button>
                </div>

                {isDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-surface border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden font-exo2">
                        <div className="p-1">
                            <div className="text-[10px] text-textMuted uppercase tracking-widest px-3 py-1.5 font-bold">
                                Sort By
                            </div>
                            {dropdownOptions.map((opt) => (
                                <button
                                    key={opt.key}
                                    onClick={() => {
                                        handleSort(opt.key);
                                        setIsDropdownOpen(false);
                                    }}
                                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-white/5 rounded-md
                                        ${currentSort === opt.key ? 'text-primary font-bold' : 'text-textMuted'}`}
                                >
                                    {opt.label}
                                    {currentSort === opt.key && <Check size={12} />}
                                </button>
                            ))}

                            <div className="h-px bg-white/5 my-1" />

                            <div className="text-[10px] text-textMuted uppercase tracking-widest px-3 py-1.5 font-bold">
                                Order
                            </div>
                            <button
                                onClick={() => { handleDir('desc'); setIsDropdownOpen(false); }}
                                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-white/5 rounded-md
                                    ${currentDir === 'desc' ? 'text-primary font-bold' : 'text-textMuted'}`}
                            >
                                Descending
                                {currentDir === 'desc' && <Check size={12} />}
                            </button>
                            <button
                                onClick={() => { handleDir('asc'); setIsDropdownOpen(false); }}
                                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-white/5 rounded-md
                                    ${currentDir === 'asc' ? 'text-primary font-bold' : 'text-textMuted'}`}
                            >
                                Ascending
                                {currentDir === 'asc' && <Check size={12} />}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
