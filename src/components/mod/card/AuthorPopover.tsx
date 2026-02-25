"use client";

import { useRef, useState } from "react";
import Tag from "@/components/ui/Tag";
import { TagData } from "@/types/mod";

interface AuthorPopoverProps {
    mainAuthor: string;
    additionalAuthors: TagData[];
}

export default function AuthorPopover({ mainAuthor, additionalAuthors }: AuthorPopoverProps) {
    const [isOpen, setIsOpen] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const hasMultiple = additionalAuthors.length > 0;

    const handleEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsOpen(true);
    };

    const handleLeave = () => {
        timeoutRef.current = setTimeout(() => setIsOpen(false), 150);
    };

    if (!hasMultiple) {
        return (
            <Tag
                category="author"
                value={mainAuthor}
                showIcon={true}
                href={`/mods?author=${encodeURIComponent(mainAuthor)}`}
            >
                {mainAuthor}
            </Tag>
        );
    }

    return (
        <div className={`relative pr-7`}>
            {/* Stacked sliver */}
            <span
                className="absolute top-0 bottom-0 right-0 w-10 bg-cyan-400/10 border border-cyan-400/20 rounded-md rounded-l-none border-l-0 overflow-hidden cursor-default z-0"
                onMouseEnter={handleEnter}
                onMouseLeave={handleLeave}
            >
                <span className="w-full h-full flex items-center justify-end pr-2 text-[13px] font-bold text-cyan-400 hover:bg-white/10 transition-colors">
                    +{additionalAuthors.length}
                </span>
            </span>

            {/* Main Author Tag */}
            <div className="relative z-10 bg-surface rounded-md">
                <Tag
                    category="author"
                    value={mainAuthor}
                    showIcon={true}
                    href={`/mods?author=${encodeURIComponent(mainAuthor)}`}
                >
                    {mainAuthor}
                </Tag>
            </div>

            {/* Tooltip */}
            {isOpen && (
                <div
                    className="absolute bottom-full right-0 mb-1 z-50 bg-surface border border-white/10 rounded-lg shadow-xl p-2 min-w-[120px]"
                    onMouseEnter={handleEnter}
                    onMouseLeave={handleLeave}
                >
                    <div className="flex flex-col gap-1">
                        {additionalAuthors.map(authorTag => (
                            <Tag
                                key={authorTag.displayName}
                                category="author"
                                value={authorTag.displayName}
                                showIcon={true}
                                href={`/mods?author=${encodeURIComponent(authorTag.displayName)}`}
                            >
                                {authorTag.displayName}
                            </Tag>
                        ))}
                    </div>
                    <div className="absolute top-full right-3 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white/10" />
                </div>
            )}
        </div>
    );
}
