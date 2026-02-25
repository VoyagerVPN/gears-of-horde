"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { ArrowRight, AlertTriangle, ChevronDown, Check, Tag as TagIcon, CircleUser, Gamepad2, Settings, Search } from "lucide-react";
import * as Popover from "@radix-ui/react-popover";
import { TagData } from "@/app/actions/tag-actions";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogBody,
    DialogFooter,
    DialogButton,
    DialogAlert,
    useToast,
} from "@/shared/ui";
import { getTagColor } from "@/lib/tag-colors";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface MergeTagModalProps {
    isOpen: boolean;
    onClose: () => void;
    sourceTag: TagData | null;
    allTags: TagData[];
    onMerge: (sourceId: string, targetId: string) => Promise<boolean>;
}

/** Get the appropriate icon for a tag category */
function getCategoryIcon(category: string) {
    switch (category) {
        case 'author':
            return CircleUser;
        case 'gamever':
            return Gamepad2;
        case 'internal':
            return Settings;
        default:
            return TagIcon;
    }
}

interface SearchableTagSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: TagData[];
    placeholder: string;
    searchPlaceholder: string;
    availableLabel: string;
    noResultsLabel: string;
}

function SearchableTagSelect({
    value,
    onChange,
    options,
    placeholder,
    searchPlaceholder,
    availableLabel,
    noResultsLabel,
}: SearchableTagSelectProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const selectedTag = options.find(t => t.id === value);
    const selectedColor = selectedTag?.color || (selectedTag ? getTagColor(selectedTag.category ?? 'tag', selectedTag.displayName) : undefined);
    const SelectedIcon = selectedTag ? getCategoryIcon(selectedTag.category ?? 'tag') : TagIcon;

    const filtered = useMemo(() => {
        if (!search.trim()) return options;
        const query = search.toLowerCase();
        return options.filter(t => t.displayName.toLowerCase().includes(query));
    }, [options, search]);

    // Focus input when popover opens
    useEffect(() => {
        if (open && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 0);
        }
    }, [open]);

    // Reset search when closing
    useEffect(() => {
        if (!open) setSearch("");
    }, [open]);

    return (
        <Popover.Root open={open} onOpenChange={setOpen}>
            <Popover.Trigger asChild>
                <button
                    type="button"
                    className={cn(
                        "w-full flex items-center justify-between bg-black/20 border border-white/10",
                        "hover:border-white/20 focus:border-white/30 rounded-lg p-2.5 text-sm text-white outline-none",
                        "h-[42px] group transition-colors"
                    )}
                >
                    <div className="flex items-center gap-2 overflow-hidden">
                        {selectedTag ? (
                            <>
                                <SelectedIcon size={14} style={{ color: selectedColor }} className="shrink-0" />
                                <span className="truncate font-medium">{selectedTag.displayName}</span>
                            </>
                        ) : (
                            <span className="text-textMuted">{placeholder}</span>
                        )}
                    </div>
                    <ChevronDown size={16} className="text-textMuted group-hover:text-white opacity-50 shrink-0" />
                </button>
            </Popover.Trigger>

            <Popover.Portal>
                <Popover.Content
                    align="start"
                    sideOffset={6}
                    onOpenAutoFocus={(e) => {
                        e.preventDefault();
                        inputRef.current?.focus();
                    }}
                    className={cn(
                        "bg-[#18181b] border border-white/10 rounded-xl shadow-2xl z-[150]",
                        "w-[var(--radix-popover-trigger-width)] min-w-[280px]",
                        "data-[state=open]:animate-in data-[state=closed]:animate-out",
                        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
                        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
                        "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2"
                    )}
                >
                    {/* Search Input */}
                    <div className="p-2 border-b border-white/5">
                        <div className="flex items-center gap-2 bg-black/30 rounded-lg px-2.5 py-1.5 border border-white/5 focus-within:border-white/20 transition-colors">
                            <Search size={14} className="text-textMuted shrink-0" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={searchPlaceholder}
                                className="flex-1 bg-transparent border-none text-sm text-white outline-none placeholder:text-textMuted/50"
                            />
                        </div>
                    </div>

                    {/* Options List */}
                    <div
                        className="p-1.5 max-h-[250px] overflow-y-auto custom-scrollbar"
                        onWheel={(e) => e.stopPropagation()}
                    >
                        <div className="px-2 py-1.5 mb-1 text-[10px] font-bold text-textMuted uppercase tracking-wider font-exo2 opacity-50">
                            {availableLabel} ({filtered.length})
                        </div>

                        {filtered.length === 0 ? (
                            <div className="px-3 py-4 text-center text-sm text-textMuted italic">
                                {noResultsLabel}
                            </div>
                        ) : (
                            filtered.map((tag) => {
                                const tagColor = tag.color || getTagColor(tag.category ?? 'tag', tag.displayName);
                                const Icon = getCategoryIcon(tag.category ?? 'tag');
                                const isSelected = tag.id === value;
                                return (
                                    <button
                                        key={tag.id}
                                        type="button"
                                        onClick={() => {
                                            onChange(tag.id!);
                                            setOpen(false);
                                        }}
                                        className={cn(
                                            "flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm",
                                            "text-textMuted cursor-pointer outline-none",
                                            "transition-colors duration-150",
                                            "hover:text-white hover:bg-white/5",
                                            isSelected && "text-white bg-white/10"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon
                                                size={16}
                                                style={{ color: tagColor }}
                                                className="shrink-0"
                                            />
                                            <span className="font-medium">{tag.displayName}</span>
                                            {tag.usageCount !== undefined && (
                                                <span className="text-xs text-textMuted opacity-60">
                                                    ({tag.usageCount})
                                                </span>
                                            )}
                                        </div>
                                        {isSelected && (
                                            <Check size={14} className="text-primary shrink-0" />
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
}

import ConfirmModal from "@/components/ui/ConfirmModal";

export default function MergeTagModal({ isOpen, onClose, sourceTag, allTags, onMerge }: MergeTagModalProps) {
    const t = useTranslations('Common');
    const t_admin = useTranslations('Admin');
    const [sourceId, setSourceId] = useState("");
    const [targetId, setTargetId] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const { showToast } = useToast();

    // Sync sourceId when modal opens with a new tag
    useEffect(() => {
        if (isOpen && sourceTag?.id) {
            setSourceId(sourceTag.id);
            setTargetId(""); // Reset target when source changes
        }
    }, [isOpen, sourceTag?.id]);

    const selectedSource = allTags.find(t => t.id === sourceId);
    const selectedTarget = allTags.find(t => t.id === targetId);

    // All tags in the same category for source selection
    const availableSources = useMemo(() => {
        if (!sourceTag) return [];
        return allTags.filter(t => t.category === sourceTag.category);
    }, [allTags, sourceTag]);

    // Targets exclude the selected source
    const availableTargets = useMemo(() => {
        if (!sourceTag || !sourceId) return [];
        return allTags.filter(t => t.id !== sourceId && t.category === sourceTag.category);
    }, [allTags, sourceTag, sourceId]);

    if (!sourceTag) return null;

    const handleMergeClick = () => {
        if (!sourceId || !targetId) return;
        setIsConfirmOpen(true);
    };

    const handleConfirmMerge = async () => {
        if (!sourceId || !targetId) return;
        
        setIsSubmitting(true);
        try {
            const success = await onMerge(sourceId, targetId);
            if (success) {
                onClose();
            }
        } catch (error) {
            console.error("Failed to merge tags:", error);
            showToast("Failed to merge tags", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <DialogContent size="md">
                    <DialogHeader className="bg-white/5 border-b border-white/10">
                        <DialogTitle>{t_admin('mergeTags')}</DialogTitle>
                    </DialogHeader>

                    <DialogBody className="space-y-6">
                        {/* Warning */}
                        <DialogAlert variant="warning" icon={<AlertTriangle size={20} />}>
                            <p className="font-bold text-yellow-400 mb-1">{t_admin('warning')}</p>
                            <p>
                                {t_admin('mergeTagWarning', { tag: selectedSource?.displayName || '...' })}
                            </p>
                        </DialogAlert>

                        {/* Source -> Target */}
                        <div className="flex items-center justify-between gap-4">
                            {/* Source Tag Selector */}
                            <div className="flex-1 flex flex-col">
                                <div className="text-[10px] text-textMuted uppercase font-bold mb-2 text-center">{t_admin('sourceTag')}</div>
                                <SearchableTagSelect
                                    value={sourceId}
                                    onChange={setSourceId}
                                    options={availableSources}
                                    placeholder={t_admin('selectTag')}
                                    searchPlaceholder={t_admin('searchTags')}
                                    availableLabel={t_admin('availableTags')}
                                    noResultsLabel={t_admin('noTagsFound')}
                                />
                            </div>

                            <div className="flex items-center pt-5">
                                <ArrowRight className="text-textMuted shrink-0" size={20} />
                            </div>

                            {/* Target Tag Selector */}
                            <div className="flex-1 flex flex-col">
                                <div className="text-[10px] text-textMuted uppercase font-bold mb-2 text-center">{t_admin('targetTag')}</div>
                                <SearchableTagSelect
                                    value={targetId}
                                    onChange={setTargetId}
                                    options={availableTargets}
                                    placeholder={t_admin('selectTag')}
                                    searchPlaceholder={t_admin('searchTags')}
                                    availableLabel={t_admin('availableTags')}
                                    noResultsLabel={t_admin('noTagsFound')}
                                />
                            </div>
                        </div>
                    </DialogBody>

                    <DialogFooter>
                        <DialogButton type="button" variant="ghost" onClick={onClose}>
                            {t('cancel')}
                        </DialogButton>
                        <DialogButton
                            type="button"
                            variant="primary"
                            disabled={!sourceId || !targetId}
                            loading={isSubmitting}
                            onClick={handleMergeClick}
                        >
                            {isSubmitting ? t_admin('merging') : t_admin('mergeTags')}
                        </DialogButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleConfirmMerge}
                title={t_admin('mergeTags')}
                message={t_admin('mergeTagConfirmMessage', {
                    source: selectedSource?.displayName || '...', 
                    target: selectedTarget?.displayName || '...' 
                })}
                confirmText={t_admin('merge')}
                cancelText={t('cancel')}
                variant="warning"
                nested={true}
            />
        </>
    );
}
