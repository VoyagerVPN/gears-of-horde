"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { RefreshCw, Star, Download, Eye, Clock, X, Filter, Loader2 } from "lucide-react";
import ModCard from "@/components/ModCard";
import { ModData, TagData } from "@/types/mod";
import { searchModsAdvanced, SortOption } from "@/app/actions/search-actions";
import GameVersionSelector from "@/components/ui/GameVersionSelector";
import Tag from "@/components/ui/Tag";
import { cn } from "@/lib/utils";

interface ModsClientProps {
    locale: 'en' | 'ru';
    initialMods: ModData[];
    initialTotalCount: number;
    initialHasMore: boolean;
    gameVersions: TagData[];
    statuses: string[];
    popularTags: { displayName: string; color?: string; count: number }[];
}

const SORT_OPTIONS: { key: SortOption; icon: typeof RefreshCw; labelKey: string }[] = [
    { key: 'updated', icon: RefreshCw, labelKey: 'recentlyUpdated' },
    { key: 'rating', icon: Star, labelKey: 'topRated' },
    { key: 'downloads', icon: Download, labelKey: 'mostDownloaded' },
    { key: 'views', icon: Eye, labelKey: 'mostViewed' },
    { key: 'newest', icon: Clock, labelKey: 'newestAdded' },
];

type FilterState = 'neutral' | 'include' | 'exclude';

export default function ModsClient({
    locale,
    initialMods,
    initialTotalCount,
    initialHasMore,
    gameVersions,
    statuses,
    popularTags
}: ModsClientProps) {
    const t = useTranslations("ModsPage");
    const tCommon = useTranslations("Common");
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    // Parse URL params
    const query = searchParams.get('q') || '';
    const version = searchParams.get('version') || '';
    const sortBy = (searchParams.get('sort') as SortOption) || 'updated';
    const includeTags = searchParams.get('tags')?.split(',').filter(Boolean) || [];
    const excludeTags = searchParams.get('exclude')?.split(',').filter(Boolean) || [];
    const includeStatuses = searchParams.get('status')?.split(',').filter(Boolean) || [];
    const excludeStatuses = searchParams.get('statusExclude')?.split(',').filter(Boolean) || [];

    // State
    const [mods, setMods] = useState<ModData[]>(initialMods);
    const [totalCount, setTotalCount] = useState(initialTotalCount);
    const [hasMore, setHasMore] = useState(initialHasMore);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    // Build tag/status filter states
    const getTagState = (tag: string): FilterState => {
        if (includeTags.includes(tag)) return 'include';
        if (excludeTags.includes(tag)) return 'exclude';
        return 'neutral';
    };

    const getStatusState = (status: string): FilterState => {
        if (includeStatuses.includes(status)) return 'include';
        if (excludeStatuses.includes(status)) return 'exclude';
        return 'neutral';
    };

    // URL update helper
    const updateUrl = useCallback((updates: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString());

        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === '') {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        });

        const newUrl = `${pathname}?${params.toString()}`;
        router.push(newUrl, { scroll: false });
    }, [pathname, router, searchParams]);

    // Handle tag click (cycle: neutral -> include -> exclude -> neutral)
    const handleTagClick = (tagName: string) => {
        const currentState = getTagState(tagName);
        let newInclude = [...includeTags];
        let newExclude = [...excludeTags];

        if (currentState === 'neutral') {
            newInclude.push(tagName);
        } else if (currentState === 'include') {
            newInclude = newInclude.filter(t => t !== tagName);
            newExclude.push(tagName);
        } else {
            newExclude = newExclude.filter(t => t !== tagName);
        }

        updateUrl({
            tags: newInclude.length > 0 ? newInclude.join(',') : null,
            exclude: newExclude.length > 0 ? newExclude.join(',') : null
        });
    };

    // Handle status click
    const handleStatusClick = (status: string) => {
        const currentState = getStatusState(status);
        let newInclude = [...includeStatuses];
        let newExclude = [...excludeStatuses];

        if (currentState === 'neutral') {
            newInclude.push(status);
        } else if (currentState === 'include') {
            newInclude = newInclude.filter(s => s !== status);
            newExclude.push(status);
        } else {
            newExclude = newExclude.filter(s => s !== status);
        }

        updateUrl({
            status: newInclude.length > 0 ? newInclude.join(',') : null,
            statusExclude: newExclude.length > 0 ? newExclude.join(',') : null
        });
    };

    // Handle sort change
    const handleSortChange = (sort: SortOption) => {
        updateUrl({ sort });
    };

    // Handle version change
    const handleVersionChange = (ver: string) => {
        updateUrl({ version: ver || null });
    };

    // Clear all filters
    const clearFilters = () => {
        router.push(pathname, { scroll: false });
    };

    // Synchronize local state with server-side props when initial data changes (via URL update)
    useEffect(() => {
        setMods(initialMods);
        setTotalCount(initialTotalCount);
        setHasMore(initialHasMore);
        setPage(1);
    }, [initialMods, initialTotalCount, initialHasMore]);

    // Load more (infinite scroll)
    const loadMore = useCallback(async () => {
        if (isLoading || !hasMore) return;

        setIsLoading(true);
        try {
            const result = await searchModsAdvanced({
                query,
                gameVersion: version,
                includeTags,
                excludeTags,
                includeStatuses,
                excludeStatuses,
                sortBy,
                page: page + 1,
                limit: 24
            });
            setMods(prev => [...prev, ...result.mods]);
            setHasMore(result.hasMore);
            setPage(p => p + 1);
        } catch (error) {
            console.error('Failed to load more mods:', error);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, hasMore, query, version, includeTags, excludeTags, includeStatuses, excludeStatuses, sortBy, page]);

    // Intersection Observer for infinite scroll
    useEffect(() => {
        if (!loadMoreRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoading) {
                    loadMore();
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(loadMoreRef.current);
        return () => observer.disconnect();
    }, [hasMore, isLoading, loadMore]);

    const hasActiveFilters = version || includeTags.length > 0 || excludeTags.length > 0 || includeStatuses.length > 0 || excludeStatuses.length > 0;

    return (
        <div className="w-[95%] max-w-[1800px] mx-auto py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white font-exo2">{t('title')}</h1>
                    {query && (
                        <p className="text-sm text-textMuted mt-1">
                            Searching for: <span className="text-white">&quot;{query}&quot;</span>
                        </p>
                    )}
                    <p className="text-xs text-textMuted mt-1">
                        {t('resultsCount', { count: totalCount })}
                    </p>
                </div>

                {/* Mobile filter toggle */}
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden flex items-center gap-2 px-3 py-2 bg-surface border border-white/10 rounded-lg text-sm text-white"
                >
                    <Filter size={16} />
                    {t('filters')}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Filters Sidebar */}
                <aside className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                    <div className="bg-surface/50 border border-white/5 rounded-lg p-4 sticky top-24 space-y-6">
                        {/* Clear filters */}
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="flex items-center gap-2 text-xs text-red-400 hover:text-red-300 transition-colors"
                            >
                                <X size={12} />
                                {t('clearFilters')}
                            </button>
                        )}

                        {/* Game Version */}
                        <div>
                            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                                {t('gameVersion')}
                            </h3>
                            <GameVersionSelector
                                value={version}
                                onChange={handleVersionChange}
                                gameVersionTags={gameVersions}
                                compact={false}
                            />
                        </div>

                        {/* Status Filter */}
                        <div>
                            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                                {t('status')} <span className="text-textMuted font-normal">{t('statusAnyMatch')}</span>
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {statuses.map(status => {
                                    const state = getStatusState(status);
                                    const isActive = state === 'include';
                                    const isExcluded = state === 'exclude';

                                    return (
                                        <button
                                            key={status}
                                            onClick={() => handleStatusClick(status)}
                                            className="transition-all active:scale-95"
                                        >
                                            <Tag
                                                category="status"
                                                value={status}
                                                showIcon={true}
                                                className={cn(
                                                    "cursor-pointer transition-all duration-200",
                                                    isExcluded && "line-through opacity-70",
                                                    !isActive && !isExcluded && "grayscale opacity-100 !bg-white/5 hover:!bg-white/10 hover:!opacity-100"
                                                )}
                                                // If not active or excluded, we want a neutral look
                                                color={(!isActive && !isExcluded) ? "#a1a1aa" : undefined}
                                            >
                                                {tCommon(`statuses.${status}`)}
                                            </Tag>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Tags Filter */}
                        <div>
                            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                                {t('tags')}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {popularTags.map(tag => {
                                    const state = getTagState(tag.displayName);
                                    const isActive = state === 'include';
                                    const isExcluded = state === 'exclude';

                                    return (
                                        <button
                                            key={tag.displayName}
                                            onClick={() => handleTagClick(tag.displayName)}
                                            className="transition-all active:scale-95"
                                            title={`${tag.count} mods`}
                                        >
                                            <Tag
                                                color={(!isActive && !isExcluded) ? "#a1a1aa" : tag.color}
                                                className={cn(
                                                    "cursor-pointer transition-all duration-200",
                                                    isExcluded && "line-through opacity-70",
                                                    !isActive && !isExcluded && "grayscale opacity-100 !bg-white/5 hover:!bg-white/10 hover:!opacity-100"
                                                )}
                                            >
                                                {tag.displayName}
                                            </Tag>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="lg:col-span-4">
                    {/* Sort Pills */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {SORT_OPTIONS.map(option => {
                            const Icon = option.icon;
                            const isActive = sortBy === option.key;
                            return (
                                <button
                                    key={option.key}
                                    onClick={() => handleSortChange(option.key)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${isActive
                                        ? 'bg-primary text-black'
                                        : 'bg-white/5 text-textMuted hover:bg-white/10 hover:text-white'
                                        }`}
                                >
                                    <Icon size={12} />
                                    {t(option.labelKey)}
                                </button>
                            );
                        })}
                    </div>

                    {/* Mod Grid */}
                    {mods.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {mods.map((mod) => (
                                    <ModCard
                                        key={mod.slug}
                                        mod={mod}
                                        locale={locale}
                                    />
                                ))}
                            </div>

                            {/* Infinite scroll trigger */}
                            <div ref={loadMoreRef} className="flex justify-center py-8">
                                {isLoading ? (
                                    <div className="flex items-center gap-2 text-textMuted text-sm">
                                        <Loader2 size={16} className="animate-spin" />
                                        {t('loadingMore')}
                                    </div>
                                ) : !hasMore ? (
                                    <p className="text-textMuted text-sm">{t('noMoreMods')}</p>
                                ) : null}
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                <Filter size={24} className="text-textMuted" />
                            </div>
                            <h2 className="text-lg font-bold text-white mb-2">{t('noModsFound')}</h2>
                            <p className="text-sm text-textMuted mb-4">{t('noModsFoundDesc')}</p>
                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="px-4 py-2 bg-primary text-black text-sm font-medium rounded hover:bg-primary/90 transition-colors"
                                >
                                    {t('clearFilters')}
                                </button>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
