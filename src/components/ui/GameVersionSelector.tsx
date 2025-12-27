"use client";

import { useState, useMemo } from "react";
import { ChevronDown, Plus, Gamepad2, Loader2, Check } from "lucide-react";
import * as Select from "@radix-ui/react-select";
import { TagData } from "@/types/mod";
import { getTagColor } from "@/lib/tag-colors";
import { normalizeGameVersion, compareGameVersions, cn } from "@/lib/utils";
import { INVALID_INPUT_STYLE } from "@/lib/constants/ui-constants";
import { useTranslations } from "next-intl";

interface GameVersionSelectorProps {
    value: string;
    onChange: (value: string) => void;
    gameVersionTags: TagData[];
    onTagsRefresh?: () => void;
    onCreateVersion?: (version: string) => void;
    /** Optional: The current/original game version to show "CURRENT" badge */
    currentVersion?: string;
    /** Optional: Use compact size for inline usage in specs panel */
    compact?: boolean;
    invalid?: boolean;
    onClear?: () => void;
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
    onCreateVersion,
    currentVersion,
    compact = false,
    invalid,
    onClear
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
        const sorted = [...gameVersionTags].sort((a, b) => compareGameVersions(b.displayName, a.displayName));

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

            // Check if version already exists
            const exists = gameVersionTags.some(t => t.displayName === normalizedVersion);
            if (exists) {
                setVersionInputError('Version already exists');
                setIsCreatingVersion(false);
                return;
            }

            // Instead of creating directly, defer to parent
            if (onCreateVersion) {
                onCreateVersion(normalizedVersion);
            } else {
                // Fallback for view-only or legacy usage
                onChange(normalizedVersion);
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
        <Select.Root value={value} onValueChange={(v) => { onChange(v); onClear?.(); }} name="gameVersion">
            <Select.Trigger
                onFocus={() => onClear?.()}
                className={cn(
                    "flex items-center justify-between text-white outline-none group bg-surface border transition-all duration-200",
                    invalid ? INVALID_INPUT_STYLE : "border-white/10 hover:border-white/20 hover:bg-white/5 focus:border-white/30",
                    compact
                        ? 'min-w-[90px] h-[32px] px-2.5 rounded-md text-xs'
                        : 'w-full h-[46px] px-4 rounded-md text-sm shadow-sm'
                )}
            >
                <Select.Value asChild>
                    <div className="flex items-center gap-2.5">
                        {value ? (
                            <Gamepad2 size={compact ? 14 : 18} style={{ color: selectedGameVersionColor }} className="drop-shadow-md" />
                        ) : (
                            <Gamepad2 size={compact ? 14 : 18} className="text-textMuted" />
                        )}
                        <span className={`font-bold tracking-wide ${!value ? "text-textMuted" : ""}`}>
                            {value || t('selectVersion')}
                        </span>
                    </div>
                </Select.Value>
                <Select.Icon>
                    <ChevronDown size={compact ? 14 : 16} className="text-textMuted group-hover:text-white transition-colors opacity-70" />
                </Select.Icon>
            </Select.Trigger>

            <Select.Portal>
                <Select.Content
                    position="popper"
                    sideOffset={6}
                    className="
                        bg-[#18181b] border border-white/10 rounded-xl shadow-2xl z-[150]
                        min-w-[240px] overflow-hidden
                        data-[state=open]:animate-in data-[state=closed]:animate-out
                        data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
                        data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
                        data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2
                    "
                >
                    <Select.Viewport className="p-1.5 max-h-[300px]">
                        <div className="px-2 py-1.5 mb-1 text-[10px] font-bold text-textMuted uppercase tracking-wider font-exo2 opacity-50">
                            {t('availableVersions')}
                        </div>

                        {gameVersionTags.map((tag) => {
                            const tagColor = tag.color || getTagColor('gamever', tag.value);
                            const isCurrent = currentVersion === tag.displayName;
                            return (
                                <Select.Item
                                    key={tag.id}
                                    value={tag.displayName}
                                    className="
                                        flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm
                                        text-textMuted cursor-pointer outline-none relative select-none
                                        transition-colors duration-150
                                        focus:text-white focus:bg-white/5
                                        data-[state=checked]:text-white data-[state=checked]:bg-white/10
                                    "
                                >
                                    <Select.ItemText asChild>
                                        <div className="flex items-center gap-3">
                                            <Gamepad2
                                                size={16}
                                                style={{ color: tagColor }}
                                                className="shrink-0 transition-transform group-hover:scale-110"
                                            />
                                            <span className="font-bold tracking-wide">{tag.displayName}</span>
                                        </div>
                                    </Select.ItemText>

                                    <div className="flex items-center gap-2">
                                        {isCurrent && (
                                            <span className="text-[10px] font-bold bg-white/10 text-white/50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                {t('current')}
                                            </span>
                                        )}
                                        <Select.ItemIndicator className="text-primary">
                                            <Check size={14} />
                                        </Select.ItemIndicator>
                                    </div>
                                </Select.Item>
                            );
                        })}

                        {/* Create new version section */}
                        <div className="border-t border-white/10 mt-2 mx-1" onPointerDown={(e) => e.stopPropagation()}>
                            <div className="px-1 py-2">
                                <label className="text-[10px] font-bold text-textMuted uppercase tracking-wider font-exo2 pl-1 mb-1 block">
                                    {t('addVersion')}
                                </label>
                                <div className="flex items-center gap-2 bg-black/30 rounded-lg p-1 border border-white/5 focus-within:border-primary/50 transition-colors">
                                    <input
                                        type="text"
                                        value={newVersionInput}
                                        onChange={(e) => {
                                            setNewVersionInput(e.target.value);
                                            setVersionInputError(null);
                                        }}
                                        onKeyDown={(e) => {
                                            e.stopPropagation();
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleCreateVersion();
                                            }
                                        }}
                                        onFocus={(e) => e.stopPropagation()}
                                        onClick={(e) => e.stopPropagation()}
                                        placeholder={suggestedNextVersion}
                                        className="flex-1 bg-transparent border-none text-sm text-white px-2 py-1 outline-none placeholder:text-textMuted/30"
                                        disabled={isCreatingVersion}
                                    />
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleCreateVersion();
                                        }}
                                        disabled={isCreatingVersion || !newVersionInput.trim() || !!versionInputError}
                                        className={`
                                            p-1.5 rounded-md transition-all duration-200
                                            ${newVersionInput.trim() && !versionInputError
                                                ? 'bg-primary text-white hover:bg-red-600 shadow-lg shadow-red-900/20'
                                                : 'bg-white/5 text-white/20 cursor-not-allowed'
                                            }
                                        `}
                                    >
                                        {isCreatingVersion ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                                    </button>
                                </div>
                                {versionInputError && (
                                    <p className="text-red-400 text-[10px] mt-1.5 ml-1 animate-in fade-in slide-in-from-left-1">
                                        {versionInputError}
                                    </p>
                                )}
                            </div>
                        </div>
                    </Select.Viewport>
                </Select.Content>
            </Select.Portal>
        </Select.Root>
    );
}
