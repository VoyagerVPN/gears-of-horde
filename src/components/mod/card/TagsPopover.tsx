"use client";

import { useRef, useState } from "react";
import Tag from "@/components/ui/Tag";
import { TagData } from "@/types/mod";

interface TagsPopoverProps {
    tags: TagData[];
    maxVisible?: number;
}

export default function TagsPopover({ tags, maxVisible = 9 }: TagsPopoverProps) {
    const [isOpen, setIsOpen] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const normalTags = tags.slice(0, maxVisible);
    const lastVisibleTag = tags[maxVisible];
    const hiddenTags = tags.slice(maxVisible + 1);
    const hasHidden = hiddenTags.length > 0 && lastVisibleTag;

    const handleEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsOpen(true);
    };

    const handleLeave = () => {
        timeoutRef.current = setTimeout(() => setIsOpen(false), 150);
    };

    return (
        <div className="flex flex-wrap gap-1 items-start content-start relative z-20">
            {normalTags.map(tag => (
                <Tag
                    key={tag.id || tag.displayName}
                    color={tag.color || undefined}
                    category={tag.category}
                    href={`/mods?tags=${encodeURIComponent(tag.displayName)}`}
                >
                    {tag.displayName}
                </Tag>
            ))}

            {lastVisibleTag && (
                <div className={`relative ${hasHidden ? 'pr-7' : ''}`}>
                    {hasHidden && (
                        <span
                            className="absolute top-0 bottom-0 right-0 w-10 bg-white/[0.025] border border-white/10 rounded-md rounded-l-none border-l-0 overflow-hidden cursor-default z-0"
                            onMouseEnter={handleEnter}
                            onMouseLeave={handleLeave}
                        >
                            <span className="w-full h-full flex items-center justify-end pr-2 text-[13px] font-bold text-textMuted hover:bg-white/10 transition-colors">
                                +{hiddenTags.length}
                            </span>
                        </span>
                    )}

                    <div className="relative z-10 bg-surface rounded-md">
                        <Tag
                            color={lastVisibleTag.color || undefined}
                            category={lastVisibleTag.category}
                            href={`/mods?tags=${encodeURIComponent(lastVisibleTag.displayName)}`}
                        >
                            {lastVisibleTag.displayName}
                        </Tag>
                    </div>

                    {isOpen && hasHidden && (
                        <div
                            className="absolute bottom-full right-0 mb-1 z-50 bg-surface border border-white/10 rounded-lg shadow-xl p-2 min-w-[120px]"
                            onMouseEnter={handleEnter}
                            onMouseLeave={handleLeave}
                        >
                            <div className="flex flex-col gap-1">
                                {hiddenTags.map(tag => (
                                    <Tag
                                        key={tag.id || tag.displayName}
                                        color={tag.color || undefined}
                                        category={tag.category}
                                        href={`/mods?tags=${encodeURIComponent(tag.displayName)}`}
                                    >
                                        {tag.displayName}
                                    </Tag>
                                ))}
                            </div>
                            <div className="absolute top-full right-3 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white/10" />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
