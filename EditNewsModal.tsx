"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Search, Eye, AlertTriangle, BookPlus, BookUp, BookUp2, HelpCircle } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogButton,
    DialogField,
    dialogInputClass,
} from "@/components/ui/Dialog";
import { updateNews, fetchNewsTags } from "@/app/actions/news-actions";
import { searchModsForSelector, ModSelectorItem } from "@/app/actions/search-actions";
import { NewsItem as NewsItemType, FrozenTag } from "@/schemas/news.schema";
import NewsCard from "@/components/NewsCard";
import GameVersionSelector from "@/components/ui/GameVersionSelector";
import RichSelector, { RichSelectorOption } from "@/components/ui/RichSelector";
import RichTextEditor from "@/components/ui/RichTextEditor";
import DatePicker from "@/components/ui/DatePicker";
import { fetchGameVersions } from "@/app/actions/search-actions";
import { TagData, ModStatusType } from "@/types/mod";
import Tag from "@/components/ui/Tag";
import { getTagColor } from "@/lib/tag-colors";
import { STATUS_OPTIONS } from "@/lib/mod-constants";
import * as Select from "@radix-ui/react-select";
import { ChevronDown } from "lucide-react";

// ============================================================================
// NEWSCAT ICON MAPPING (reusing Tag.tsx icons)
// ============================================================================
const NEWSCAT_ICONS: Record<string, typeof BookPlus> = {
    'new': BookPlus,
    'status': BookPlus,
    'release': BookUp2,
    'update': BookUp,
};

function getNewscatIcon(value: string) {
    return NEWSCAT_ICONS[value.toLowerCase()] || HelpCircle;
}

// ============================================================================
// TYPES
// ============================================================================
interface EditNewsModalProps {
    news: NewsItemType | null;
    isOpen: boolean;
    onClose: () => void;
    onSaved: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================
export default function EditNewsModal({
    news,
    isOpen,
    onClose,
    onSaved,
}: EditNewsModalProps) {
    const t = useTranslations("Admin");
    const t_modal = useTranslations("EditNewsModal");
    const tCommon = useTranslations("Common");
    const locale = useLocale() as 'en' | 'ru';

    // State
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<NewsItemType>>({});
    const [newscatTags, setNewscatTags] = useState<FrozenTag[]>([]);
    const [gameVersionTags, setGameVersionTags] = useState<TagData[]>([]);
    const [selectedNewscat, setSelectedNewscat] = useState<string>('update');
    const [selectedStatus, setSelectedStatus] = useState<ModStatusType>('active');

    // Mod selector state
    const [modSearchQuery, setModSearchQuery] = useState("");
    const [modSearchResults, setModSearchResults] = useState<ModSelectorItem[]>([]);
    const [isModDropdownOpen, setIsModDropdownOpen] = useState(false);

    // Original values for comparison (to detect changes)
    const [originalModVersion, setOriginalModVersion] = useState<string>("");
    const [originalGameVersion, setOriginalGameVersion] = useState<string>("");
    const [originalStatus, setOriginalStatus] = useState<ModStatusType | undefined>();

    // Fetch newscat tags and game versions on mount
    useEffect(() => {
        fetchNewsTags().then(setNewscatTags);
        fetchGameVersions().then(setGameVersionTags);
    }, []);

    // Debounced mod search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (modSearchQuery.trim()) {
                const results = await searchModsForSelector(modSearchQuery);
                setModSearchResults(results);
            } else {
                // Show all mods when empty
                const results = await searchModsForSelector("");
                setModSearchResults(results);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [modSearchQuery]);

    // Initialize form data when news changes or modal opens
    useEffect(() => {
        if (isOpen && news) {
            setFormData({
                modName: news.modName,
                modSlug: news.modSlug,
                modVersion: news.modVersion,
                gameVersion: news.gameVersion,
                actionText: news.actionText,
                content: news.content,
                description: news.description,
                date: news.date,
                wipeRequired: news.wipeRequired,
                sourceUrl: news.sourceUrl,
                tags: news.tags,
            });
            setModSearchQuery(news.modName || "");
            setOriginalModVersion(news.modVersion || "");
            setOriginalGameVersion(news.gameVersion || "");

            // Set newscat from existing tags
            const newscatTag = news.tags.find(t => t.category === 'newscat');
            if (newscatTag) {
                setSelectedNewscat(newscatTag.displayName.toLowerCase());
            }

            // Try to extract status from tags
            const statusTag = news.tags.find(t => t.category === 'status');
            if (statusTag) {
                setOriginalStatus(statusTag.displayName.toLowerCase() as ModStatusType);
                setSelectedStatus(statusTag.displayName.toLowerCase() as ModStatusType);
            }
        } else if (isOpen && !news) {
            setFormData({});
            setSelectedNewscat('update');
            setModSearchQuery("");
            setOriginalModVersion("");
            setOriginalGameVersion("");
            setOriginalStatus(undefined);
        }
    }, [isOpen, news]);

    // Current form values with defaults
    const currentData = {
        modName: formData.modName ?? "",
        modSlug: formData.modSlug ?? "",
        modVersion: formData.modVersion ?? "",
        gameVersion: formData.gameVersion ?? "",
        actionText: formData.actionText ?? "released",
        content: formData.content ?? "",
        description: formData.description ?? "",
        date: formData.date ?? news?.date ?? new Date().toISOString(),
        wipeRequired: formData.wipeRequired ?? false,
        sourceUrl: formData.sourceUrl ?? "",
        tags: formData.tags ?? news?.tags ?? [],
    };

    // ========================================================================
    // SUMMARY AUTO-GENERATION
    // ========================================================================
    const autoSummary = useMemo(() => {
        const parts: React.ReactNode[] = [];

        // Check what changed
        const modVersionChanged = currentData.modVersion !== originalModVersion && currentData.modVersion;
        const gameVersionChanged = currentData.gameVersion !== originalGameVersion && currentData.gameVersion;
        const statusChanged = selectedNewscat === 'status' && selectedStatus !== originalStatus;

        // Mod version changed → "X.X.X released"
        if (modVersionChanged) {
            parts.push(
                <span key="modver" className="inline-flex items-center gap-1">
                    <Tag category="modver" value={currentData.modVersion} showIcon>
                        {currentData.modVersion}
                    </Tag>
                    <span>released</span>
                </span>
            );
        }

        // Game version changed → "VX.X support"
        if (gameVersionChanged) {
            if (parts.length > 0) parts.push(<span key="sep1">. </span>);
            parts.push(
                <span key="gamever" className="inline-flex items-center gap-1">
                    <Tag category="gamever" value={currentData.gameVersion} showIcon>
                        {currentData.gameVersion}
                    </Tag>
                    <span>support</span>
                </span>
            );
        }

        // Status change
        if (statusChanged && originalStatus) {
            if (parts.length > 0) parts.push(<span key="sep2">. </span>);

            // Determine summary text based on status transition
            if (originalStatus === 'upcoming' && selectedStatus === 'active') {
                parts.push(<span key="status">Mod released</span>);
            } else if (['discontinued', 'on_hold', 'unknown'].includes(originalStatus) && selectedStatus === 'active') {
                parts.push(<span key="status">Development continued</span>);
            } else if (selectedStatus === 'on_hold') {
                parts.push(<span key="status">Development paused</span>);
            } else if (selectedStatus === 'discontinued') {
                parts.push(<span key="status">Discontinued</span>);
            } else if (selectedStatus === 'unknown') {
                parts.push(<span key="status">Status unknown</span>);
            } else {
                // Generic status change
                parts.push(
                    <span key="status" className="inline-flex items-center gap-1">
                        Status changed to
                        <Tag category="status" value={selectedStatus} showIcon>
                            {tCommon(`statuses.${selectedStatus}`)}
                        </Tag>
                    </span>
                );
            }
        }

        // If nothing changed, show a default
        if (parts.length === 0) {
            return <span className="text-textMuted">No changes detected</span>;
        }

        return <span className="flex flex-wrap items-center gap-1">{parts}</span>;
    }, [currentData.modVersion, currentData.gameVersion, originalModVersion, originalGameVersion, selectedNewscat, selectedStatus, originalStatus, tCommon]);

    // Plain text summary for saving
    const autoSummaryText = useMemo(() => {
        const parts: string[] = [];

        const modVersionChanged = currentData.modVersion !== originalModVersion && currentData.modVersion;
        const gameVersionChanged = currentData.gameVersion !== originalGameVersion && currentData.gameVersion;
        const statusChanged = selectedNewscat === 'status' && selectedStatus !== originalStatus;

        if (modVersionChanged) {
            parts.push(`${currentData.modVersion} released`);
        }
        if (gameVersionChanged) {
            parts.push(`${currentData.gameVersion} support`);
        }
        if (statusChanged && originalStatus) {
            if (originalStatus === 'upcoming' && selectedStatus === 'active') {
                parts.push("Mod released");
            } else if (['discontinued', 'on_hold', 'unknown'].includes(originalStatus) && selectedStatus === 'active') {
                parts.push("Development continued");
            } else if (selectedStatus === 'on_hold') {
                parts.push("Development paused");
            } else if (selectedStatus === 'discontinued') {
                parts.push("Discontinued");
            } else if (selectedStatus === 'unknown') {
                parts.push("Status unknown");
            }
        }

        return parts.join(". ") || "Updated";
    }, [currentData.modVersion, currentData.gameVersion, originalModVersion, originalGameVersion, selectedNewscat, selectedStatus, originalStatus]);

    // ========================================================================
    // CONTENT FIELD VALIDATION
    // ========================================================================
    const isGameVersionOnlyChange = useMemo(() => {
        const modVersionChanged = currentData.modVersion !== originalModVersion;
        const gameVersionChanged = currentData.gameVersion !== originalGameVersion;
        return gameVersionChanged && !modVersionChanged && !currentData.content.trim();
    }, [currentData.modVersion, currentData.gameVersion, currentData.content, originalModVersion, originalGameVersion]);

    // ========================================================================
    // NEWSCAT OPTIONS FOR RICHSELECTOR
    // ========================================================================
    const newscatOptions: RichSelectorOption[] = useMemo(() => {
        const originalNewscat = news?.tags.find(t => t.category === 'newscat')?.displayName.toLowerCase();

        return newscatTags.map(tag => {
            const value = tag.displayName.toLowerCase();
            const Icon = getNewscatIcon(value);
            // Use tag.color from DB, or fallback to centralized tag-colors.ts
            const tagColor = tag.color || getTagColor('newscat', value);
            return {
                value,
                label: tag.displayName,
                icon: Icon,
                iconColor: tagColor, // Pass hex color directly
                labelColor: tagColor, // Pass hex color directly
                isCurrent: value === originalNewscat,
            };
        });
    }, [newscatTags, news]);

    const statusOptions: RichSelectorOption[] = useMemo(() => {
        return STATUS_OPTIONS.map(opt => ({
            value: opt.value,
            label: tCommon(`statuses.${opt.value}`),
            icon: opt.icon,
            // Extract text-x-500 from the color class or use it as is
            // RichSelector handles both hex and Tailwind classes
            iconColor: opt.color,
            labelColor: opt.color,
            isCurrent: opt.value === originalStatus,
        }));
    }, [originalStatus, tCommon]);

    // ========================================================================
    // BUILD PREVIEW TAGS
    // ========================================================================
    const previewTags = useMemo(() => {
        const baseTags = currentData.tags.filter((t: FrozenTag) => t.category !== 'newscat');
        const selectedNewscatTag = newscatTags.find(t => t.displayName.toLowerCase() === selectedNewscat);
        if (selectedNewscatTag) {
            return [{
                id: selectedNewscatTag.id,
                displayName: selectedNewscatTag.displayName,
                color: selectedNewscatTag.color,
                category: 'newscat'
            }, ...baseTags];
        }
        return baseTags;
    }, [currentData.tags, selectedNewscat, newscatTags]);

    // ========================================================================
    // HANDLERS
    // ========================================================================
    const handleChange = <K extends keyof NewsItemType>(field: K, value: NewsItemType[K]) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleModSelect = useCallback((mod: ModSelectorItem) => {
        setFormData(prev => ({
            ...prev,
            modName: mod.title,
            modSlug: mod.slug,
        }));
        setModSearchQuery(mod.title);
        setIsModDropdownOpen(false);
    }, []);

    const handleSave = async () => {
        if (!news) return;

        setLoading(true);
        try {
            // Build updated tags array with correct newscat
            const updatedTags: FrozenTag[] = currentData.tags.filter((t: FrozenTag) => t.category !== 'newscat');
            const selectedNewscatTag = newscatTags.find(t => t.displayName.toLowerCase() === selectedNewscat);
            if (selectedNewscatTag) {
                updatedTags.unshift({
                    id: selectedNewscatTag.id,
                    displayName: selectedNewscatTag.displayName,
                    color: selectedNewscatTag.color,
                    category: 'newscat'
                });
            }

            const result = await updateNews(news.id, {
                modName: currentData.modName,
                modSlug: currentData.modSlug,
                modVersion: currentData.modVersion || undefined,
                gameVersion: currentData.gameVersion || undefined,
                actionText: autoSummaryText, // Use auto-generated summary
                content: currentData.content,
                description: currentData.description || undefined,
                date: new Date(currentData.date),
                wipeRequired: currentData.wipeRequired,
                sourceUrl: currentData.sourceUrl || undefined,
                tags: updatedTags,
            });

            if (result.success) {
                onSaved();
                onClose();
                setFormData({});
            }
        } finally {
            setLoading(false);
        }
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            onClose();
            setFormData({});
        }
    };

    // Construct preview item with reactive tags
    const previewItem: NewsItemType = {
        id: "preview",
        date: currentData.date,
        modName: currentData.modName || "Mod Name",
        modSlug: currentData.modSlug,
        modVersion: currentData.modVersion || undefined,
        gameVersion: currentData.gameVersion || undefined,
        actionText: autoSummaryText || "released",
        content: currentData.content || "News content will appear here",
        description: currentData.description || undefined,
        wipeRequired: currentData.wipeRequired,
        sourceUrl: currentData.sourceUrl,
        tags: previewTags,
    };

    // Status selector enabled only when newscat is 'status'
    const isStatusSelectorEnabled = selectedNewscat === 'status';
    const currentStatusConfig = STATUS_OPTIONS.find(o => o.value === selectedStatus);
    const StatusIcon = currentStatusConfig?.icon || HelpCircle;

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent size="xl" className="!max-w-5xl !h-[80vh] !max-h-[80vh]" hideCloseButton>
                {/* Custom Header Area */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0">
                    <DialogTitle>{t("editNews")}</DialogTitle>
                    <div className="flex items-center gap-2">
                        <DialogButton variant="secondary" size="sm" onClick={onClose} disabled={loading}>
                            {t("cancel")}
                        </DialogButton>
                        <DialogButton
                            variant="primary"
                            size="sm"
                            onClick={handleSave}
                            loading={loading}
                            disabled={!currentData.modName || !currentData.content || isGameVersionOnlyChange}
                        >
                            {t("save")}
                        </DialogButton>
                    </div>
                </div>

                <div className="flex flex-1 min-h-0 overflow-hidden">
                    {/* === LEFT COLUMN: EDITOR === */}
                    <div className="w-[55%] flex flex-col border-r border-white/5 overflow-y-auto custom-scrollbar">
                        <div className="p-5 space-y-4">
                            {/* Mod Name Selector */}
                            <DialogField label={t("modName")} smallLabel required className="col-span-2">
                                <div className="relative">
                                    <div className="relative">
                                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
                                        <input
                                            id="news-mod-name"
                                            name="modName"
                                            type="text"
                                            className={`${dialogInputClass} pl-9`}
                                            value={modSearchQuery}
                                            onChange={(e) => {
                                                setModSearchQuery(e.target.value);
                                                setIsModDropdownOpen(true);
                                            }}
                                            onFocus={() => setIsModDropdownOpen(true)}
                                            placeholder={t_modal("searchMod")}
                                            autoComplete="off"
                                        />
                                    </div>

                                    {/* Dropdown */}
                                    {isModDropdownOpen && modSearchResults.length > 0 && (
                                        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-surface border border-white/10 rounded-lg shadow-xl max-h-[200px] overflow-y-auto">
                                            {modSearchResults.map((mod) => (
                                                <button
                                                    key={mod.slug}
                                                    type="button"
                                                    onClick={() => handleModSelect(mod)}
                                                    className="w-full px-3 py-2 text-left text-sm hover:bg-white/10 transition-colors flex items-center justify-between"
                                                >
                                                    <span className="text-white">{mod.title}</span>
                                                    <span className="text-textMuted text-xs font-mono">{mod.slug}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </DialogField>

                            {/* Metadata Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                {/* Row 1: Newscat | Status */}
                                <DialogField label={t_modal("newsCategory")} smallLabel>
                                    <RichSelector
                                        value={selectedNewscat}
                                        onChange={setSelectedNewscat}
                                        options={newscatOptions}
                                        placeholder={t_modal("selectCategory")}
                                        currentLabel={tCommon("current")}
                                    />
                                </DialogField>

                                <DialogField label={tCommon("status")} smallLabel>
                                    <RichSelector
                                        value={selectedStatus}
                                        onChange={(val) => setSelectedStatus(val as ModStatusType)}
                                        options={statusOptions}
                                        placeholder={t_modal("selectCategory")}
                                        currentLabel={tCommon("current")}
                                        disabled={!isStatusSelectorEnabled}
                                    />
                                </DialogField>

                                {/* Row 2: Modver | Gamever */}
                                <DialogField label={tCommon("modVersion")} smallLabel>
                                    <input
                                        id="news-mod-version"
                                        name="modVersion"
                                        type="text"
                                        className={dialogInputClass}
                                        value={currentData.modVersion}
                                        onChange={(e) => handleChange("modVersion", e.target.value)}
                                        placeholder="e.g. 1.0.0"
                                    />
                                </DialogField>

                                <DialogField label={tCommon("gameVersion")} smallLabel>
                                    <GameVersionSelector
                                        value={currentData.gameVersion}
                                        onChange={(val) => handleChange("gameVersion", val)}
                                        gameVersionTags={gameVersionTags}
                                        currentVersion={news?.gameVersion}
                                    />
                                </DialogField>

                                {/* Row 3: Date | Source */}
                                <DialogField label={tCommon("releaseDate")} smallLabel>
                                    <DatePicker
                                        value={new Date(currentData.date)}
                                        onChange={(date) => handleChange("date", date?.toISOString() || new Date().toISOString())}
                                        locale={locale}
                                        className="w-full h-[42px] bg-black/20 border border-white/10 rounded-md justify-between px-3"
                                    />
                                </DialogField>

                                <DialogField label={t_modal("source")} smallLabel>
                                    <input
                                        id="news-source-url"
                                        name="sourceUrl"
                                        type="url"
                                        className={dialogInputClass}
                                        value={currentData.sourceUrl}
                                        onChange={(e) => handleChange("sourceUrl", e.target.value)}
                                        placeholder="https://..."
                                    />
                                </DialogField>

                                {/* Row 4: Wipe */}
                                <DialogField label={tCommon("wipe")} smallLabel>
                                    <label className={`flex items-center gap-2 h-[42px] px-3 rounded-md cursor-pointer transition-colors ${currentData.wipeRequired
                                        ? 'bg-red-500/20 border border-red-500/40 text-red-400'
                                        : 'bg-black/20 border border-white/10 hover:bg-black/30 text-textMuted'
                                        }`}>
                                        <input
                                            id="news-wipe-required"
                                            name="wipeRequired"
                                            type="checkbox"
                                            checked={currentData.wipeRequired}
                                            onChange={(e) => handleChange("wipeRequired", e.target.checked)}
                                            className="w-4 h-4 accent-red-500"
                                        />
                                        <AlertTriangle size={16} className={currentData.wipeRequired ? 'text-red-400' : 'text-textMuted'} />
                                        <span className={`text-sm font-medium ${currentData.wipeRequired ? 'text-red-400' : ''}`}>
                                            {tCommon("wipe")}
                                        </span>
                                    </label>
                                </DialogField>
                            </div>

                            {/* Separator */}
                            <div className="h-px bg-white/5" />

                            {/* Auto-Generated Summary (read-only) */}
                            <DialogField label={t_modal("summary")} smallLabel>
                                <div className="px-3 py-2.5 bg-black/30 border border-white/10 rounded-lg text-sm min-h-[42px] flex items-center">
                                    {autoSummary}
                                </div>
                            </DialogField>

                            {/* Content Editor (RichTextEditor) */}
                            <DialogField
                                label={t_modal("content")}
                                smallLabel
                                required={isGameVersionOnlyChange}
                            >
                                <RichTextEditor
                                    id="news-content"
                                    name="content"
                                    value={currentData.content}
                                    onChange={(val) => handleChange("content", val)}
                                    placeholder={isGameVersionOnlyChange
                                        ? t_modal("contentRequiredForGameVersionChange")
                                        : t_modal("contentPlaceholder")
                                    }
                                    minHeight="120px"
                                    invalid={isGameVersionOnlyChange}
                                />
                                {isGameVersionOnlyChange && (
                                    <p className="text-xs text-amber-400 mt-1">
                                        {t_modal("contentRequiredHint")}
                                    </p>
                                )}
                            </DialogField>
                        </div>
                    </div>

                    {/* === RIGHT COLUMN: PREVIEW === */}
                    <div className="w-[45%] flex flex-col bg-black/30 overflow-hidden">
                        {/* Preview Header */}
                        <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-surface/50 shrink-0">
                            <div className="flex items-center gap-2 text-textMuted">
                                <Eye size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Live Preview</span>
                            </div>
                        </div>

                        {/* Preview Body */}
                        <div className="flex-1 p-4 overflow-y-auto">
                            <div className="w-full">
                                <NewsCard
                                    {...previewItem}
                                    locale={locale}
                                    date={previewItem.date || new Date().toISOString()}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
