"use client";

import { useState, useMemo } from "react";
import { ChevronDown, Plus, Gamepad2, Loader2, Search, X, Info } from "lucide-react";
import * as Select from "@radix-ui/react-select";
import { TagData } from "@/types/mod";
import { getTagColor } from "@/lib/tag-colors";
import { parseGameVersion, formatGameVersion, compareGameVersions, cn } from "@/lib/utils";
import { INVALID_INPUT_STYLE } from "@/lib/constants/ui-constants";
import { useTranslations } from "next-intl";
import { useSupabaseAuth } from "@/components/SupabaseAuthProvider";

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
 * RESTRICTION: Only ADMINs can create new versions.
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
    const { role } = useSupabaseAuth();
    const isAdmin = role === 'ADMIN';

    const [newVersionInput, setNewVersionInput] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreatingVersion, setIsCreatingVersion] = useState(false);
    const [versionInputError, setVersionInputError] = useState<string | null>(null);

    // Get selected game version tag info
    const selectedGameVersionTag = gameVersionTags.find(tag => tag.displayName === value);
    const selectedGameVersionColor = selectedGameVersionTag?.color || getTagColor('gamever', value);

    // Filter and sort tags
    const filteredTags = useMemo(() => {
        let tags = gameVersionTags;
        if (searchQuery.trim()) {
            tags = tags.filter(t => t.displayName.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        
        // Sort by weight if available, otherwise fallback to name comparison
        return [...tags].sort((a, b) => {
            const wA = a.weight ?? 0;
            const wB = b.weight ?? 0;
            if (wA !== 0 || wB !== 0) {
                return wB - wA; // Newest first (highest weight)
            }
            return compareGameVersions(b.displayName, a.displayName);
        });
    }, [gameVersionTags, searchQuery]);

    // Live preview for admin new version creation
    const previewVersion = useMemo(() => {
        if (!newVersionInput.trim()) return null;
        const parsed = parseGameVersion(newVersionInput);
        if (!parsed) return null;
        return {
            display: formatGameVersion(parsed, 'display'),
            storage: formatGameVersion(parsed, 'value')
        };
    }, [newVersionInput]);

    // Calculate suggested next version (latest + 0.1)
    const suggestedNextVersion = useMemo(() => {
        if (gameVersionTags.length === 0) return 'V1.0';

        // Sort tags by version number (newest first)
        const sorted = [...gameVersionTags].sort((a, b) => {
            const wA = a.weight ?? 0;
            const wB = b.weight ?? 0;
            if (wA !== 0 || wB !== 0) return wB - wA;
            return compareGameVersions(b.displayName, a.displayName);
        });

        const latest = sorted[0]?.displayName || 'V1.0';
        const parsed = parseGameVersion(latest);
        if (!parsed) return 'V1.0';

        return `V${parsed.v1}.${parsed.v2 + 1}`;
    }, [gameVersionTags]);

    // Handle creating a new game version
    const handleCreateVersion = async () => {
        if (!isAdmin) return;
        
        const trimmedInput = newVersionInput.trim();
        if (!trimmedInput) return;

        const parsed = parseGameVersion(trimmedInput);
        if (!parsed) {
            setVersionInputError('Invalid format (e.g. V1.1 b14, A21)');
            return;
        }

        const normalizedVersion = formatGameVersion(parsed, 'display');

        setVersionInputError(null);
        setIsCreatingVersion(true);
        try {
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
                    "flex items-center justify-between text-white outline-none group bg-black/20 border transition-colors duration-200 cursor-pointer",
                    invalid ? INVALID_INPUT_STYLE : "border-white/10 hover:border-white/20 focus:border-white/30",
                    compact
                        ? 'min-w-[90px] h-[32px] px-2.5 rounded-md text-xs'
                        : 'w-full h-[42px] p-2.5 rounded-md text-sm'
                )}
            >
                <div className="flex items-center gap-2 truncate">
                    {value ? (
                        <Gamepad2 size={compact ? 14 : 16} style={{ color: selectedGameVersionColor }} className="drop-shadow-md shrink-0" />
                    ) : (
                        <Gamepad2 size={compact ? 14 : 16} className="text-textMuted shrink-0" />
                    )}
                    <span className={cn(
                        "truncate font-medium",
                        !value ? "text-textMuted/60" : ""
                    )}>
                        <Select.Value placeholder={t('selectVersion')} />
                    </span>
                </div>
                <Select.Icon>
                    <ChevronDown size={compact ? 14 : 16} className="text-textMuted group-hover:text-white transition-colors opacity-50" />
                </Select.Icon>
            </Select.Trigger>

            <Select.Portal>
                <Select.Content
                    position="popper"
                    sideOffset={6}
                    className="
                        bg-surface border border-white/10 rounded-md shadow-xl z-[150]
                        min-w-[240px] overflow-hidden
                        data-[state=open]:animate-in data-[state=closed]:animate-out
                        data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
                        data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
                        data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2
                    "
                >
                    <Select.Viewport className="p-1 max-h-[300px] flex flex-col">
                        <div className="px-1 py-1 shrink-0 flex items-center gap-1" onPointerDown={(e) => e.stopPropagation()}>
                            <div className="flex-1 flex items-center gap-2 bg-black/20 rounded-md p-1 border border-white/5 focus-within:border-primary/50 transition-colors mx-1 h-8">
                                <Search size={12} className="text-textMuted ml-1" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    onFocus={(e) => e.stopPropagation()}
                                    placeholder={t('search')}
                                    className="flex-1 bg-transparent border-none text-xs text-white px-1 py-1 outline-none placeholder:text-textMuted/30 h-full cursor-text"
                                />
                                {value && (
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            onChange("");
                                            onClear?.();
                                        }}
                                        className="p-1 hover:bg-white/10 text-primary hover:text-white rounded-md transition-colors mr-1"
                                        title={t('clear')}
                                    >
                                        <X size={12} />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="overflow-y-auto max-h-[200px]">
                            {filteredTags.length > 0 ? (
                                filteredTags.map((tag) => {
                                    const tagColor = tag.color || getTagColor('gamever', tag.value);
                                    const isCurrent = currentVersion === tag.displayName;
                                    return (
                                        <Select.Item
                                            key={tag.id}
                                            value={tag.displayName}
                                            onPointerDown={(_e) => {
                                                if (value === tag.displayName) {
                                                    onChange("");
                                                    onClear?.();
                                                }
                                            }}
                                            className="
                                                flex items-center justify-between w-full px-2 py-2 rounded-md text-sm
                                                text-textMuted cursor-pointer outline-none relative select-none
                                                transition-colors duration-150
                                                hover:text-white hover:bg-white/10
                                                focus:text-white focus:bg-white/5
                                                data-[state=checked]:text-white data-[state=checked]:bg-white/5
                                                group
                                            "
                                        >
                                            <div className="flex items-center gap-2">
                                                <Gamepad2
                                                    size={16}
                                                    style={{ color: tagColor }}
                                                    className="shrink-0"
                                                />
                                                <Select.ItemText>
                                                    <span className="font-medium tracking-wide">{tag.displayName}</span>
                                                </Select.ItemText>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {isCurrent && (
                                                    <span className="text-[9px] font-bold bg-white/10 text-white/50 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                                                        {t('current')}
                                                    </span>
                                                )}
                                            </div>
                                        </Select.Item>
                                    );
                                })
                            ) : (
                                <div className="p-4 text-center text-textMuted text-xs italic">
                                    {t('noResults')}
                                </div>
                            )}
                        </div>

                        {onCreateVersion && isAdmin && (
                            <div className="border-t border-white/10 mt-2 pt-2 mx-1 shrink-0" onPointerDown={(e) => e.stopPropagation()}>
                                <div className="px-1 py-1">
                                    <div className="flex items-center justify-between mb-1 px-1">
                                        <label className="text-[10px] font-bold text-textMuted uppercase tracking-wider font-exo2">
                                            {t('addVersion')}
                                        </label>
                                        {previewVersion && (
                                            <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-right-2">
                                                <Info size={10} className="text-primary" />
                                                <span className="text-[9px] text-white/40 font-mono italic">
                                                    Will create: <span className="text-white/80">{previewVersion.display}</span>
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 bg-black/20 rounded-md p-1 border border-white/5 focus-within:border-primary/50 transition-colors">
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
                                            className="flex-1 bg-transparent border-none text-xs text-white px-2 py-1 outline-none placeholder:text-textMuted/30"
                                            disabled={isCreatingVersion}
                                        />
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleCreateVersion();
                                            }}
                                            disabled={isCreatingVersion || !newVersionInput.trim() || !!versionInputError}
                                            className={cn(
                                                "p-1 rounded-md transition-all duration-200",
                                                newVersionInput.trim() && !versionInputError
                                                    ? 'bg-primary text-white hover:bg-red-600 shadow-lg shadow-red-900/20'
                                                    : 'bg-white/5 text-white/20 cursor-not-allowed'
                                            )}
                                        >
                                            {isCreatingVersion ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                                        </button>
                                    </div>
                                    {versionInputError && (
                                        <p className="text-red-400 text-[10px] mt-1.5 ml-1 animate-in fade-in slide-in-from-left-1">
                                            {versionInputError}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                    </Select.Viewport>
                </Select.Content>
            </Select.Portal>
        </Select.Root>
    );
}
