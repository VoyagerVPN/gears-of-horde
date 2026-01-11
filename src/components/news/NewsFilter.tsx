'use client';

import { FrozenTag } from "@/schemas/news.schema";
import { Link } from "@/i18n/routing";
import Tag from "@/components/ui/Tag";
import SearchBar from "@/components/ui/SearchBar";
import { useState } from "react";
import { Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface NewsFilterProps {
    tags: FrozenTag[];
    currentTag?: string;
}

export default function NewsFilter({ tags, currentTag }: NewsFilterProps) {
    const [search, setSearch] = useState("");
    const t = useTranslations('NewsFilter');

    // Group tags by category
    const categories = tags.reduce((acc, tag) => {
        const cat = tag.category || 'other';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(tag);
        return acc;
    }, {} as Record<string, FrozenTag[]>);

    // Sort categories order
    const categoryOrder = ['newscat', 'gamever', 'tag', 'other'];
    const sortedCategories = Object.keys(categories).sort((a, b) => {
        const indexA = categoryOrder.indexOf(a);
        const indexB = categoryOrder.indexOf(b);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return a.localeCompare(b);
    });

    const filteredTags = (tagList: FrozenTag[]) => {
        if (!search) return tagList;
        return tagList.filter(t => t.displayName.toLowerCase().includes(search.toLowerCase()));
    };

    const getCategoryLabel = (cat: string) => {
        switch (cat) {
            case 'newscat': return t('categories.newscat');
            case 'gamever': return t('categories.gamever');
            case 'tag': return t('categories.tag');
            default: return t('categories.other');
        }
    };

    return (
        <div className="bg-surface border border-white/5 rounded-xl p-5 h-fit sticky top-24">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-white font-bold uppercase tracking-wide text-sm">
                    <Filter size={16} className="text-primary" />
                    <span>{t('filters')}</span>
                </div>
                {currentTag && (
                    <Link href="/news" className="text-[10px] font-bold text-red-400 hover:text-red-300 flex items-center gap-1 uppercase tracking-wider bg-red-500/10 px-2 py-1 rounded border border-red-500/20 hover:bg-red-500/20 transition-colors">
                        <X size={10} />{t('clear')}
                    </Link>
                )}
            </div>

            <SearchBar
                value={search}
                onChange={setSearch}
                placeholder={t('searchTags')}
                variant="compact"
                className="mb-6"
            />

            <div className="space-y-6">
                {sortedCategories.map(cat => {
                    const catTags = filteredTags(categories[cat]);
                    if (catTags.length === 0) return null;

                    return (
                        <div key={cat}>
                            <h4 className="text-[10px] font-bold text-textMuted uppercase tracking-widest mb-3 flex items-center gap-2">
                                {getCategoryLabel(cat)}
                                <span className="h-px flex-1 bg-white/5"></span>
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {catTags.map((tag, idx) => {
                                    const isActive = currentTag === tag.displayName;
                                    return (
                                        <Tag
                                            key={tag.id || `${tag.displayName}-${idx}`}
                                            href={isActive ? '/news' : `/news?tag=${tag.displayName}`}
                                            color={tag.color || undefined}
                                            className={cn(
                                                isActive && "bg-primary text-white border-primary shadow-lg"
                                            )}
                                        >
                                            {tag.displayName}
                                        </Tag>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
