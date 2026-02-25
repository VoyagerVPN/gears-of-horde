"use client";

import Tag from "@/components/ui/Tag";

interface SelectedTag {
    displayName: string;
    category?: string;
    value?: string;
    color?: string | null;
}

interface SelectedTagsProps {
    tags: SelectedTag[];
    category: string;
    onRemove: (tagName: string) => void;
}

export default function SelectedTags({ tags, category, onRemove }: SelectedTagsProps) {
    if (tags.length === 0) return null;

    const filteredTags = tags
        .filter(t => t.category === category || !t.category)
        .sort((a, b) => a.displayName.localeCompare(b.displayName));

    return (
        <div className="flex flex-wrap gap-2">
            {filteredTags.map(tag => (
                <Tag
                    key={tag.displayName}
                    category={tag.category || category}
                    value={tag.value}
                    color={tag.color || undefined}
                    showIcon={true}
                    onRemove={() => onRemove(tag.displayName)}
                >
                    {tag.displayName}
                </Tag>
            ))}
        </div>
    );
}
