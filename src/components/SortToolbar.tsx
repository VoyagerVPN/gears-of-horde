"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Clock, Flame, Star } from "lucide-react";
import { useCallback } from "react";

type SortOption = 'updated' | 'rating' | 'downloads' | 'views';

export default function SortToolbar() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const currentSort = (searchParams.get('sort') as SortOption) || 'updated';

    const handleSort = useCallback((sort: SortOption) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('sort', sort);
        if (!params.has('dir')) {
            params.set('dir', 'desc');
        }
        router.push(pathname + '?' + params.toString());
    }, [pathname, router, searchParams]);

    const buttons = [
        { key: 'updated', label: 'Updated', icon: Clock },
        { key: 'downloads', label: 'Featured', icon: Flame },
        { key: 'rating', label: 'Top Rated', icon: Star },
    ];

    return (
        <div className="flex items-center gap-1 bg-surface/50 backdrop-blur-sm p-1.5 rounded-lg border border-white/5">
            {buttons.map((btn) => {
                const isActive = currentSort === btn.key;
                return (
                    <button
                        key={btn.key}
                        onClick={() => handleSort(btn.key as SortOption)}
                        className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-md transition-colors uppercase tracking-wide
                            ${isActive
                                ? 'bg-primary/20 text-primary border border-primary/30'
                                : 'text-textMuted hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <btn.icon size={14} />
                        {btn.label}
                    </button>
                );
            })}
        </div>
    );
}
