'use client';

import { TagData } from "@/types/mod";
import { Link } from "@/i18n/routing";
import Tag from "@/components/ui/Tag";
import SearchBar from "@/components/ui/SearchBar";
import { useState } from "react";
import { Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface NewsFilterProps {
    tags: TagData[];
    currentTag?: string;
}

export default function NewsFilter({ tags, currentTag }: NewsFilterProps) {
    const [search, setSearch] = useState("");

    // Group tags
    const categories = tags.reduce((acc, tag) => {
        const cat = tag.category || 'other';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(tag);
        return acc;
    }, {} as Record<string, TagData[]>);

    // Sort categories order
    const categoryOrder = ['newscat', 'gamever', 'tag', 'other'];
    const sortedCategories = Object.keys(categories).sort((a, b) => {
        const indexA = categoryOrder.indexOf(a);
        const indexB = categoryOrder.indexOf(b);
        // If both are in the list, sort by index
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        // If only A is in the list, A comes first
        if (indexA !== -1) return -1;
        // If only B is in the list, B comes first
        if (indexB !== -1) return 1;
        // Otherwise sort alphabetically
        return a.localeCompare(b);
    });

    const filteredTags = (tagList: TagData[]) => {
        if (!search) return tagList;
        return tagList.filter(t => t.displayName.toLowerCase().includes(search.toLowerCase()));
    };

    const getCategoryLabel = (cat: string) => {
        switch (cat) {
            case 'newscat': return 'Categories';
            case 'gamever': return 'Game Versions';
            case 'tag': return 'Tags';
            default: return 'Other';
        }
    };

    return (
        <div className="bg-surface border border-white/5 rounded-xl p-5 h-fit sticky top-24">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-white font-bold uppercase tracking-wide text-sm">
                    <Filter size={16} className="text-primary" />
                    <span>Filters</span>
                </div>
                {currentTag && (
                    <Link href="/news" className="text-[10px] font-bold text-red-400 hover:text-red-300 flex items-center gap-1 uppercase tracking-wider bg-red-500/10 px-2 py-1 rounded border border-red-500/20 hover:bg-red-500/20 transition-colors">
                        <X size={10} /> Clear
                    </Link>
                )}
            </div>

            <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Search tags..."
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
                                {catTags.map(tag => {
                                    const isActive = currentTag === tag.displayName;
                                    return (
                                        <Tag
                                            key={tag.id}
                                            href={isActive ? '/news' : `/news?tag=${tag.displayName}`}
                                            color={tag.color || undefined}
                                            className={cn(
                                                isActive && "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                                            )}
                                        >
                                            {tag.displayName}
                                            {(tag.usageCount || 0) > 0 && <span className="opacity-40 text-[9px] ml-1">({tag.usageCount})</span>}
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
