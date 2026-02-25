"use client";

import { X } from "lucide-react";
import { TagData } from "@/app/actions/tag-actions";

interface SelectedSearchTagsProps {
    tags: TagData[];
    onRemove: (tagName: string) => void;
}

export default function SelectedSearchTags({ tags, onRemove }: SelectedSearchTagsProps) {
    if (tags.length === 0) return null;

    return (
        <div className="flex items-center gap-2 flex-wrap mt-3">
            {tags.map(tag => (
                <span
                    key={tag.displayName}
                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs bg-white/5 border border-white/10 animate-in fade-in zoom-in-95 duration-200"
                >
                    <span style={{ color: tag.color || '#a1a1aa' }}>{tag.displayName}</span>
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onRemove(tag.displayName); }}
                        className="text-textMuted hover:text-red-400 transition-colors"
                    >
                        <X size={10} aria-hidden="true" />
                    </button>
                </span>
            ))}
        </div>
    );
}
