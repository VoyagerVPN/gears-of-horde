"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Plus, Check, Gamepad2 } from "lucide-react";
import { TagData } from "@/types/mod";
import { createTag, recalculateGameVersionColors } from "@/app/actions/tag-actions";
import { getTagColor, colorToTagStyles } from "@/lib/tag-colors";

interface GameVersionSelectorProps {
    value: string;
    onChange: (value: string) => void;
    gameVersionTags: TagData[];
    onTagsRefresh?: () => void;
}

/**
 * Game Version Selector with ability to create new versions
 * 
 * Uses unified dropdown style matching SearchBar component
 */
export default function GameVersionSelector({
    value,
    onChange,
    gameVersionTags,
    onTagsRefresh
}: GameVersionSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [newVersionInput, setNewVersionInput] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                setIsCreating(false);
                setNewVersionInput("");
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus input when creating new
    useEffect(() => {
        if (isCreating && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isCreating]);

    const handleCreateVersion = async () => {
        if (!newVersionInput.trim()) return;

        setIsSubmitting(true);
        try {
            // Create the tag
            await createTag({
                category: 'gamever',
                value: newVersionInput.trim().toLowerCase().replace(/[^a-z0-9.]/g, '_'),
                displayName: newVersionInput.trim(),
            });

            // Recalculate colors for all game versions
            await recalculateGameVersionColors();

            // Select the new version
            onChange(newVersionInput.trim());

            // Refresh tags
            if (onTagsRefresh) {
                onTagsRefresh();
            }

            // Reset state
            setNewVersionInput("");
            setIsCreating(false);
            setIsOpen(false);
        } catch (error) {
            console.error("Failed to create game version:", error);
            alert("Failed to create game version");
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedTag = gameVersionTags.find(t => t.displayName === value);
    const selectedColor = selectedTag?.color || getTagColor('gamever', value);

    return (
        <div ref={dropdownRef} className="relative">
            {/* Trigger button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-between gap-2 bg-black/40 border border-white/10 rounded px-2 py-1 text-white font-mono text-[10px] min-w-[80px] text-right outline-none focus:border-primary hover:bg-black/60 transition-colors"
                style={selectedColor ? colorToTagStyles(selectedColor) : undefined}
            >
                <Gamepad2 size={10} />
                <span>{value || 'Select version'}</span>
                <ChevronDown size={12} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-white/10 rounded-lg shadow-xl z-50 min-w-[140px]">
                    {/* Existing versions */}
                    <div className="p-1 max-h-48 overflow-y-auto">
                        {gameVersionTags.map((tag) => {
                            const tagColor = tag.color || getTagColor('gamever', tag.value);
                            return (
                                <button
                                    key={tag.id}
                                    type="button"
                                    onClick={() => {
                                        onChange(tag.displayName);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left transition-colors hover:bg-white/10 ${value === tag.displayName ? 'bg-white/10' : ''
                                        }`}
                                >
                                    <div
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: tagColor }}
                                    />
                                    <span className="text-[10px] font-mono text-white flex-1">{tag.displayName}</span>
                                    {value === tag.displayName && (
                                        <Check size={10} className="text-primary" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Divider */}
                    <div className="border-t border-white/10" />

                    {/* Create new section */}
                    {isCreating ? (
                        <div className="p-2">
                            <div className="flex gap-1">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={newVersionInput}
                                    onChange={(e) => setNewVersionInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleCreateVersion();
                                        } else if (e.key === 'Escape') {
                                            setIsCreating(false);
                                            setNewVersionInput("");
                                        }
                                    }}
                                    placeholder="e.g., V1.2"
                                    className="flex-1 bg-black/40 border border-white/10 rounded px-2 py-1 text-white font-mono text-[10px] outline-none focus:border-primary"
                                    disabled={isSubmitting}
                                />
                                <button
                                    type="button"
                                    onClick={handleCreateVersion}
                                    disabled={isSubmitting || !newVersionInput.trim()}
                                    className="px-2 py-1 bg-primary hover:bg-red-600 disabled:bg-white/10 rounded text-white text-[10px] font-bold transition-colors disabled:text-textMuted"
                                >
                                    {isSubmitting ? '...' : 'Add'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setIsCreating(true)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-[10px] text-primary hover:bg-white/5 transition-colors"
                        >
                            <Plus size={10} />
                            <span>Create new version</span>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
