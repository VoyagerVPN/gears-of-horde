"use client";

import { TrendingUp } from "lucide-react";
import Tag from "@/components/ui/Tag";
import { TagData } from "@/app/actions/tag-actions";
import { useTranslations } from "next-intl";

interface PopularTagsProps {
    tags: TagData[];
    selectedTags: Array<{ displayName: string; category?: string }>;
    category: string;
    onAdd: (tagName: string) => void;
}

export default function PopularTags({ tags, selectedTags, category, onAdd }: PopularTagsProps) {
    const t = useTranslations('Common');

    const isSelected = (tagName: string) => {
        return selectedTags.some(s => s.displayName.toLowerCase() === tagName.toLowerCase());
    };

    const availableTags = tags.filter(p => !isSelected(p.displayName)).slice(0, 6);

    if (availableTags.length === 0) return null;

    return (
        <div className="p-2">
            <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-textMuted mb-2 px-1">
                <TrendingUp size={10} />
                {t('popularTags')}
            </div>
            <div className="flex flex-wrap gap-1.5">
                {availableTags.map(tag => (
                    <div key={tag.id} className="cursor-pointer">
                        <Tag
                            category={tag.category || category}
                            value={tag.category === 'author' ? 'author' : undefined}
                            color={tag.color || undefined}
                            showIcon={true}
                            onContentClick={() => onAdd(tag.displayName)}
                            actions={[{
                                icon: <span className="opacity-80">({tag.usageCount ?? 0})</span>,
                                onClick: () => onAdd(tag.displayName),
                                variant: 'transparent'
                            }]}
                        >
                            {tag.displayName}
                        </Tag>
                    </div>
                ))}
            </div>
        </div>
    );
}
