"use client";

import { useState, useMemo } from "react";
import { ChevronDown, Plus, Gamepad2, Loader2 } from "lucide-react";
import * as Select from "@radix-ui/react-select";
import { TagData } from "@/types/mod";
import { createTag, recalculateGameVersionColors } from "@/app/actions/tag-actions";
import { getTagColor } from "@/lib/tag-colors";
import { normalizeGameVersion, gameVersionToTagValue } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface GameVersionSelectorProps {
    value: string;
    onChange: (value: string) => void;
    gameVersionTags: TagData[];
    onTagsRefresh?: () => void;
    /** Optional: The current/original game version to show "CURRENT" badge */
    currentVersion?: string;
    /** Optional: Use compact size for inline usage in specs panel */
    compact?: boolean;
}

/**
 * Game Version Selector with Radix Select and ability to create new versions
 * 
 * Uses Gamepad2 icons with version-based colors
 */
export default function GameVersionSelector({
    value,
    onChange,
    gameVersionTags,
    onTagsRefresh,
    currentVersion,
    compact = false
}: GameVersionSelectorProps) {
    const t = useTranslations('Common');

    const [newVersionInput, setNewVersionInput] = useState("");
    const [isCreatingVersion, setIsCreatingVersion] = useState(false);
    const [versionInputError, setVersionInputError] = useState<string | null>(null);

    // Get selected game version tag info
    const selectedGameVersionTag = gameVersionTags.find(tag => tag.displayName === value);
    const selectedGameVersionColor = selectedGameVersionTag?.color || getTagColor('gamever', value);

    // Calculate suggested next version (latest + 0.1)
    const suggestedNextVersion = useMemo(() => {
        if (gameVersionTags.length === 0) return 'V1.0';

        // Sort tags by version number (newest first)
        const sorted = [...gameVersionTags].sort((a, b) => {
            const aVersion = (a.displayName || '').replace(/^[vV]/, '');
            const bVersion = (b.displayName || '').replace(/^[vV]/, '');
            const aParts = aVersion.split('.').map(Number);
            const bParts = bVersion.split('.').map(Number);

            for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
                const aNum = aParts[i] || 0;
                const bNum = bParts[i] || 0;
                if (aNum !== bNum) return bNum - aNum;
            }
            return 0;
        });

        const latest = sorted[0]?.displayName || 'V1.0';
        const versionStr = latest.replace(/^[vV]/, '');
        const parts = versionStr.split('.');

        if (parts.length >= 2) {
            const major = parseInt(parts[0]) || 0;
            const minor = parseInt(parts[1]) || 0;
            return `V${major}.${minor + 1}`;
        }

        return 'V1.0';
    }, [gameVersionTags]);

    // Validate version format (Vx.x or x.x)
    const isValidVersionFormat = (input: string): boolean => {
        const pattern = /^[vV]?\d+\.\d+$/;
        return pattern.test(input.trim());
    };

    // Handle creating a new game version
    const handleCreateVersion = async () => {
        const trimmedInput = newVersionInput.trim();
        if (!trimmedInput) return;

        // Validate format
        if (!isValidVersionFormat(trimmedInput)) {
            setVersionInputError('Format: Vx.x (e.g., V2.6)');
            return;
        }

        setVersionInputError(null);
        setIsCreatingVersion(true);
        try {
            const normalizedVersion = normalizeGameVersion(trimmedInput);
            const tagValue = gameVersionToTagValue(normalizedVersion);

            // Check if version already exists
            const exists = gameVersionTags.some(t => t.displayName === normalizedVersion);
            if (exists) {
                setVersionInputError('Version already exists');
                setIsCreatingVersion(false);
                return;
            }

            await createTag({
                category: 'gamever',
                value: tagValue,
                displayName: normalizedVersion,
            });

            await recalculateGameVersionColors();
            onChange(normalizedVersion);

            if (onTagsRefresh) {
                onTagsRefresh();
            }

            setNewVersionInput("");
        } catch (error) {
            console.error("Failed to create game version:", error);
            setVersionInputError('Failed to create version');
        } finally {
            setIsCreatingVersion(false);
        }
    };

    return (
        <Select.Root value={value} onValueChange={onChange}>
            <Select.Trigger className={`flex items-center justify-between bg-black/20 border border-white/10 hover:border-white/30 focus:border-primary/50 rounded-lg text-white outline-none group transition-colors ${compact ? 'px-2 py-1 text-xs h-[28px] gap-1 w-auto' : 'p-2.5 text-sm h-[42px] w-full gap-2'}`}>
                <Select.Value asChild>
                    <div className={`flex items-center ${compact ? 'gap-1' : 'gap-2'}`}>
                        {value ? (
                            <Gamepad2 size={compact ? 12 : 16} style={{ color: selectedGameVersionColor }} />
                        ) : (
                            <Gamepad2 size={compact ? 12 : 16} className="text-textMuted" />
                        )}
                        <span className={`${!value ? "text-textMuted" : "font-mono"} ${compact ? 'text-xs' : ''}`}>
                            {value || t('selectVersion')}
                        </span>
                    </div>
                </Select.Value>
                <Select.Icon>
                    <ChevronDown size={compact ? 12 : 16} className="text-textMuted group-hover:text-white opacity-50 transition-transform duration-200" />
                </Select.Icon>
            </Select.Trigger>

            <Select.Portal>
                <Select.Content
                    position="popper"
                    sideOffset={5}
                    className="overflow-hidden bg-surface border border-white/10 rounded-lg shadow-xl z-[150] w-[var(--radix-select-trigger-width)]"
                >
                    <Select.Viewport className="p-1 max-h-[300px]">
                        {gameVersionTags.map((tag) => {
                            const tagColor = tag.color || getTagColor('gamever', tag.value);
                            const isCurrent = currentVersion === tag.displayName;
                            return (
                                <Select.Item
                                    key={tag.id}
                                    value={tag.displayName}
                                    className="flex items-center justify-between px-2 py-2 text-sm text-textMuted hover:text-white hover:bg-white/10 rounded cursor-pointer outline-none data-[state=checked]:text-white data-[state=checked]:bg-white/5 data-[highlighted]:bg-white/10 data-[highlighted]:text-white transition-colors group relative select-none"
                                >
                                    <Select.ItemText asChild>
                                        <div className="flex items-center gap-2 min-w-0">
                                            <Gamepad2 size={16} style={{ color: tagColor }} className="shrink-0" />
                                            <span className="font-mono truncate">{tag.displayName}</span>
                                        </div>
                                    </Select.ItemText>
                                    <div className="flex items-center gap-2">
                                        {isCurrent && (
                                            <span className="text-[9px] bg-white/10 text-white/50 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                                                {t('current')}
                                            </span>
                                        )}
                                    </div>
                                </Select.Item>
                            );
                        })}

                        {/* Create new version row */}
                        <div className="border-t border-white/10 mt-1 pt-1 pb-1 px-2" onPointerDown={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-2 py-1">
                                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                    <Plus size={12} className="text-primary" />
                                </div>
                                <input
                                    type="text"
                                    value={newVersionInput}
                                    onChange={(e) => {
                                        setNewVersionInput(e.target.value);
                                        setVersionInputError(null);
                                    }}
                                    onKeyDown={(e) => {
                                        // Prevent Select from capturing keys
                                        e.stopPropagation();
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleCreateVersion();
                                        }
                                    }}
                                    onFocus={(e) => e.stopPropagation()}
                                    onClick={(e) => e.stopPropagation()}
                                    placeholder={suggestedNextVersion}
                                    size={1}
                                    className={`flex-1 min-w-0 bg-transparent border-b ${versionInputError ? 'border-red-500' : 'border-white/20 focus:border-primary'} text-sm text-white outline-none py-1 placeholder:text-textMuted/50 font-mono`}
                                    disabled={isCreatingVersion}
                                />
                                {newVersionInput.trim() && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleCreateVersion();
                                        }}
                                        disabled={isCreatingVersion || !!versionInputError}
                                        className="px-2 py-1 bg-primary hover:bg-red-600 text-white text-xs font-bold rounded transition-colors disabled:opacity-50"
                                    >
                                        {isCreatingVersion ? <Loader2 size={12} className="animate-spin" /> : t('add')}
                                    </button>
                                )}
                            </div>
                            {versionInputError && (
                                <p className="text-red-400 text-[10px] ml-8 mb-1">{versionInputError}</p>
                            )}
                        </div>
                    </Select.Viewport>
                </Select.Content>
            </Select.Portal>
        </Select.Root>
    );
}
