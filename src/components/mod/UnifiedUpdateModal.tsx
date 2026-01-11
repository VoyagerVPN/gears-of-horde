"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
    Save, AlertTriangle, ChevronDown, ExternalLink,
    Search, LayoutGrid, Layout, Eye, Check,
    BookPlus, BookUp, BookUp2, HelpCircle
} from "lucide-react";
import * as Select from "@radix-ui/react-select";
import DatePicker from "@/components/ui/DatePicker";
import GameVersionSelector from "@/components/ui/GameVersionSelector";
import RichTextEditor from "@/components/ui/RichTextEditor";
import RichSelector from "@/components/ui/RichSelector";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
    DialogDescription, DialogBody, DialogFooter, DialogButton,
    DialogField, dialogInputClass
} from "@/components/ui/Dialog";
import { useTranslations, useLocale } from "next-intl";
import { STATUS_OPTIONS } from "@/lib/mod-constants";
import { getTagColor } from "@/lib/tag-colors";
import { ModData, ModStatusType, TagData } from "@/types/mod";
import { updateNews, fetchNewsTags } from "@/app/actions/news-actions";
import { searchModsForSelector, ModSelectorItem } from "@/app/actions/search-actions";
import { NewsItem, NewsUpdate, FrozenTag } from "@/schemas/news.schema";
import NewsCard from "@/components/NewsCard";
import Tag from "@/components/ui/Tag";
import VersionTag from "@/components/VersionTag";

interface UnifiedUpdateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaved?: () => void;
    onSave?: (data: any) => void;
    // Context: either we are editing an existing news item OR updating a mod
    news?: NewsItem;
    mod?: ModData; // If present, modal is locked to this mod (Quick Update)
    gameVersionTags?: TagData[];
}

const NEWSCAT_ICONS: Record<string, typeof BookPlus> = {
    'new': BookPlus,
    'status': BookPlus,
    'release': BookUp2,
    'update': BookUp,
};

function getNewscatIcon(slug?: string) {
    if (!slug) return HelpCircle;
    return NEWSCAT_ICONS[slug.toLowerCase()] || HelpCircle;
}

export default function UnifiedUpdateModal({
    isOpen,
    onClose,
    onSaved,
    onSave,
    news,
    mod,
    gameVersionTags = [],
}: UnifiedUpdateModalProps) {
    const t = useTranslations("UnifiedUpdateModal");
    const tCommon = useTranslations("Common");
    const locale = useLocale() as "en" | "ru";

    // --- State ---
    const [isAdvanced, setIsAdvanced] = useState(!!news); // Default to Advanced if editing news, Simple if updating mod
    const [isSaving, setIsSaving] = useState(false);
    const [modResults, setModResults] = useState<ModSelectorItem[]>([]);
    const [modSearchQuery, setModSearchQuery] = useState(mod?.title || news?.modName || "");
    const [isModDropdownOpen, setIsModDropdownOpen] = useState(false);
    const [newscatTags, setNewscatTags] = useState<FrozenTag[]>([]);

    // Derive initial status from news tags if needed
    const getInitialStatus = (): ModStatusType => {
        if (mod?.status) return mod.status;
        if (news?.tags) {
            const statusTag = news.tags.find(t => t.category === 'status');
            if (statusTag?.displayName) {
                return statusTag.displayName.toLowerCase() as ModStatusType;
            }
        }
        return "active";
    };

    const [formData, setFormData] = useState({
        modId: mod?.slug || "",
        modTitle: mod?.title || news?.modName || "",
        modSlug: mod?.slug || news?.modSlug || "",
        version: mod?.version || news?.modVersion || "",
        gameVersion: mod?.gameVersion || news?.gameVersion || "",
        status: getInitialStatus(),
        wipeRequired: news?.wipeRequired || false,
        date: news?.date || new Date().toISOString(),
        sourceUrl: news?.sourceUrl || "",
        content: news?.content || "",
        newscatTagId: news?.newscatTagId || "",
    });

    const [newscatOverride, setNewscatOverride] = useState(!!news?.newscatTagId);

    // --- Load Tags ---
    useEffect(() => {
        const loadTags = async () => {
            const tags = await fetchNewsTags();
            setNewscatTags(tags);
            // If no category selected yet, we'll auto-determine it later
        };
        loadTags();
    }, []);

    // --- Auto-Determination Logic ---
    const isVersionChanged = useMemo(() => {
        const originalVersion = mod?.version || news?.modVersion || "";
        return formData.version !== originalVersion;
    }, [formData.version, mod, news]);

    const autoNewscatValue = useMemo(() => {
        if (!mod && !news) return "update";
        const currentModStatus = mod?.status || getInitialStatus();

        if (isVersionChanged) return "update";
        if (formData.gameVersion !== (mod?.gameVersion || news?.gameVersion)) return "update";
        if (currentModStatus === "upcoming" && formData.status !== "upcoming") return "release";
        if (formData.status !== currentModStatus) return "status";

        return "update";
    }, [formData, mod, news, isVersionChanged]);

    // Update auto newscat tag if not overridden
    useEffect(() => {
        if (!newscatOverride && newscatTags.length > 0) {
            // Match based on displayName (case-insensitive)
            const autoTag = newscatTags.find(t => t.displayName.toLowerCase() === autoNewscatValue);
            if (autoTag && formData.newscatTagId !== autoTag.id) {
                setFormData(prev => ({ ...prev, newscatTagId: autoTag.id || "" }));
            }
        }
    }, [autoNewscatValue, newscatTags, newscatOverride, formData.newscatTagId]);

    // --- Sync State on Open/Prop Change ---
    useEffect(() => {
        if (isOpen) {
            setModSearchQuery(mod?.title || news?.modName || "");

            const initialStatus = mod?.status || (news?.tags?.find(t => t.category === 'status')?.displayName.toLowerCase() as ModStatusType) || "active";

            setFormData(prev => ({
                ...prev,
                modId: mod?.slug || "",
                modTitle: mod?.title || news?.modName || "",
                modSlug: mod?.slug || news?.modSlug || "",
                version: mod?.version || news?.modVersion || "",
                gameVersion: mod?.gameVersion || news?.gameVersion || "",
                status: initialStatus,
                wipeRequired: news?.wipeRequired || false,
                date: news?.date || prev.date, // Keep current date if new, or reset? Usually keep existing date logic or current date.
                sourceUrl: news?.sourceUrl || "",
                content: news?.content || "",
                newscatTagId: news?.newscatTagId || "",
            }));

            setNewscatOverride(!!news?.newscatTagId);
        }
    }, [isOpen, mod, news]);

    // --- Handlers ---
    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleModSelect = (m: ModSelectorItem) => {
        setFormData(prev => ({
            ...prev,
            modId: m.id,
            modTitle: m.title,
            modSlug: m.slug,
            version: m.version,
            gameVersion: m.gameVersion,
            status: m.status as ModStatusType
        }));
        setModSearchQuery(m.title); // Update input directly
        setIsModDropdownOpen(false);
    };

    // Debounced mod search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (modSearchQuery.trim()) {
                const results = await searchModsForSelector(modSearchQuery);
                setModResults(results);
            } else {
                // Show all mods when empty
                const results = await searchModsForSelector("");
                setModResults(results);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [modSearchQuery]);

    const handleSave = async () => {
        // We need EITHER a modId (to update mod) OR news.id (to update news)
        // AND we need content if version didn't change
        if ((!formData.modId && !news?.id) || (!formData.content.trim() && !isVersionChanged)) return;

        setIsSaving(true);
        try {
            if (onSave) {
                // Determine logic slug from the selected tag logic
                const selectedTag = newscatTags.find(t => t.id === formData.newscatTagId);
                const logicSlug = selectedTag?.displayName ? selectedTag.displayName.toLowerCase() : "update";

                // If onSave is provided, we delegate saving to the parent
                await onSave({
                    ...formData,
                    isSaveBreaking: formData.wipeRequired,
                    // Map content to changes for compatibility if needed
                    changes: [formData.content],
                    description: formData.content, // Often used interchangeably
                    newscat: logicSlug
                });
            } else if (news?.id) {
                // Direct update for news
                await updateNews(news.id, {
                    modName: formData.modTitle,
                    modSlug: formData.modSlug,
                    modVersion: formData.version,
                    gameVersion: formData.gameVersion,
                    content: formData.content,
                    date: new Date(formData.date),
                    wipeRequired: formData.wipeRequired,
                    sourceUrl: formData.sourceUrl,
                });
                onSaved?.();
            } else {
                // Default fallback
                console.log("Saving unified update (internal):", formData);
            }
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    // --- Auto Summary Generation ---
    const autoSummary = useMemo(() => {
        const parts = [];
        const isRu = locale === "ru";

        if (isVersionChanged) {
            parts.push(<VersionTag key="v" type="mod" version={formData.version} />);
            parts.push(isRu ? " выпущена" : " released");
        } else {
            const actionMap: Record<string, string> = {
                'active': t(`statusActionResumed`),
                'on_hold': t(`statusActionPaused`),
                'discontinued': t(`statusActionDiscontinued`),
                'upcoming': t(`statusActionAnnounced`),
                'unknown': t(`statusActionUpdated`)
            };
            const action = actionMap[formData.status] || actionMap['unknown'];
            parts.push(isRu ? "Разработка " : "Development of ");
            parts.push(<strong key="t" className="text-white">{formData.modTitle}</strong>);
            parts.push(` ${action}`);
        }
        return <div className="flex items-center gap-1.5 flex-wrap">{parts}</div>;
    }, [formData, isVersionChanged, locale, t]);

    // --- Preview Data ---
    const previewItem = useMemo(() => ({
        id: news?.id || "preview",
        modTitle: formData.modTitle,
        modSlug: formData.modSlug,
        modVersion: formData.version,
        gameVersion: formData.gameVersion,
        modStatus: formData.status,
        content: formData.content,
        date: formData.date,
        wipeRequired: formData.wipeRequired,
        sourceUrl: formData.sourceUrl,
        newscatTag: newscatTags.find(tg => tg.id === formData.newscatTagId),
    }), [formData, newscatTags, news]);

    // --- Options ---
    const newscatOptions = newscatTags.map(tg => ({
        value: tg.id || "",
        label: tg.displayName,
        iconColor: getTagColor('newscat', tg.displayName.toLowerCase(), tg.color),
        labelColor: getTagColor('newscat', tg.displayName.toLowerCase(), tg.color),
        icon: getNewscatIcon(tg.displayName.toLowerCase())
    }));

    const statusOptions = STATUS_OPTIONS.map(opt => ({
        value: opt.value,
        label: tCommon(`statuses.${opt.value}`),
        iconColor: opt.color,
        labelColor: opt.color,
        icon: opt.icon
    }));

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                size={isAdvanced ? "6xl" : "xl"}
                className={isAdvanced ? "!h-[85vh]" : ""}
                hideCloseButton
            >
                <DialogHeader className="border-b border-white/5 flex flex-row items-center justify-between p-5 py-4">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isAdvanced ? "bg-primary/10 text-primary" : "bg-zinc-500/10 text-zinc-400"}`}>
                            {isAdvanced ? <LayoutGrid size={20} /> : <Layout size={20} />}
                        </div>
                        <div>
                            <DialogTitle className="text-lg">
                                {formData.modTitle ? <span className="text-primary font-bold uppercase">{formData.modTitle}</span> : t("title")}
                            </DialogTitle>
                            <DialogDescription className="text-xs">
                                {formData.modTitle ? t("title") : "Select a mod to update"}
                            </DialogDescription>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 bg-black/40 p-1 rounded-xl border border-white/5">
                        <button
                            onClick={() => setIsAdvanced(false)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${!isAdvanced ? "bg-white/10 text-white shadow-lg" : "text-textMuted hover:text-white"}`}
                        >
                            <Layout size={14} /> {t("simpleMode")}
                        </button>
                        <button
                            onClick={() => setIsAdvanced(true)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isAdvanced ? "bg-primary text-white shadow-lg" : "text-textMuted hover:text-white"}`}
                        >
                            <LayoutGrid size={14} /> {t("advancedMode")}
                        </button>
                    </div>
                </DialogHeader>

                <div className="flex flex-1 min-h-0 overflow-hidden flex-row">
                    {/* Form Column */}
                    <div className={`flex flex-col overflow-y-auto custom-scrollbar transition-all duration-500 ease-in-out ${isAdvanced ? "w-[55%] border-r border-white/5" : "w-full"}`}>
                        <div className="p-6 space-y-6">

                            {/* Mod Selection */}
                            <DialogField label={t("modName")} smallLabel>
                                <div className="relative group">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted group-focus-within:text-white transition-colors" size={16} />
                                        <input
                                            className={`${dialogInputClass} pl-10 cursor-text`}
                                            placeholder={t("searchMod")}
                                            value={modSearchQuery}
                                            onChange={(e) => {
                                                setModSearchQuery(e.target.value);
                                                setIsModDropdownOpen(true);
                                            }}
                                            onFocus={() => setIsModDropdownOpen(true)}
                                            autoComplete="off"
                                        />
                                    </div>
                                    {isModDropdownOpen && modResults.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                                            {modResults.map(m => (
                                                <button
                                                    key={m.id}
                                                    onClick={() => handleModSelect(m)}
                                                    className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 cursor-pointer"
                                                >
                                                    <div className="font-bold text-white">{m.title}</div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {/* Click outside listener could be added, but for now simple focus logic or relying on selecting helps */}
                                    {isModDropdownOpen && (
                                        <div className="fixed inset-0 z-40" onClick={() => setIsModDropdownOpen(false)} />
                                    )}
                                </div>
                            </DialogField>

                            {/* Metadata Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <DialogField label={t("newsCategory")} smallLabel>
                                    <div className="relative group">
                                        <RichSelector
                                            value={formData.newscatTagId}
                                            options={newscatOptions}
                                            onChange={(val) => {
                                                handleChange("newscatTagId", val);
                                                setNewscatOverride(true);
                                            }}
                                            placeholder={t("selectCategory")}
                                        />
                                        {!newscatOverride && (
                                            <div className="absolute -top-2 -right-2 bg-primary text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter border-2 border-surface shadow-lg z-10">
                                                {t("auto")}
                                            </div>
                                        )}
                                    </div>
                                </DialogField>

                                <DialogField label={t("status")} smallLabel>
                                    <RichSelector
                                        value={formData.status}
                                        options={statusOptions}
                                        onChange={(val) => handleChange("status", val)}
                                        placeholder={t("status")}
                                    />
                                </DialogField>

                                <DialogField label={t("newVersion")} smallLabel>
                                    <input
                                        className={dialogInputClass}
                                        value={formData.version}
                                        onChange={(e) => handleChange("version", e.target.value)}
                                        placeholder="1.0.0"
                                    />
                                </DialogField>

                                <DialogField label={t("gameVersion")} smallLabel>
                                    <GameVersionSelector
                                        value={formData.gameVersion}
                                        onChange={(val) => handleChange("gameVersion", val)}
                                        gameVersionTags={gameVersionTags}
                                        currentVersion={mod?.gameVersion || news?.gameVersion}
                                    />
                                </DialogField>

                                <DialogField label={t("releaseDate")} smallLabel>
                                    <DatePicker
                                        value={new Date(formData.date)}
                                        onChange={(d) => handleChange("date", d?.toISOString() || new Date().toISOString())}
                                        locale={locale}
                                        className="w-full h-[42px] bg-black/20 border border-white/10 rounded-md justify-between px-3"
                                    />
                                </DialogField>

                                <DialogField label={t("source")} smallLabel>
                                    <div className="relative">
                                        <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={14} />
                                        <input
                                            className={`${dialogInputClass} pl-9`}
                                            value={formData.sourceUrl}
                                            onChange={(e) => handleChange("sourceUrl", e.target.value)}
                                            placeholder="https://..."
                                        />
                                    </div>
                                </DialogField>
                            </div>

                            {/* Wipe Required - Clickable Red Card */}
                            <div
                                onClick={() => handleChange("wipeRequired", !formData.wipeRequired)}
                                className={`group relative overflow-hidden rounded-xl border p-4 cursor-pointer transition-all duration-300 ${formData.wipeRequired
                                    ? "bg-red-500/10 border-red-500/30 ring-1 ring-red-500/20 shadow-lg"
                                    : "bg-black/20 border-white/5 hover:border-white/10"}`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg transition-colors ${formData.wipeRequired ? "bg-red-500 text-white" : "bg-white/5 text-textMuted"}`}>
                                            <AlertTriangle size={20} />
                                        </div>
                                        <div>
                                            <h4 className={`text-sm font-bold uppercase tracking-wider ${formData.wipeRequired ? "text-red-400" : "text-white"}`}>
                                                {t("wipeRequired")}
                                            </h4>
                                            <p className="text-[10px] text-textMuted">Save-breaking update: Users must start over</p>
                                        </div>
                                    </div>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${formData.wipeRequired ? "border-red-500 bg-red-500" : "border-white/10 group-hover:border-white/30"}`}>
                                        {formData.wipeRequired && <Check size={12} className="text-white" />}
                                    </div>
                                </div>
                            </div>

                            {/* Auto Summary */}
                            <DialogField label={t("summary")} smallLabel>
                                <div className="px-4 py-3 bg-black/40 border border-white/5 rounded-xl text-sm min-h-[44px] flex items-center">
                                    {autoSummary}
                                </div>
                            </DialogField>

                            {/* Content / Changelog Editor */}
                            <DialogField label={t("content")} smallLabel>
                                <RichTextEditor
                                    id="unified-content"
                                    value={formData.content}
                                    onChange={(val) => handleChange("content", val)}
                                    placeholder={t("contentPlaceholder")}
                                    minHeight={isAdvanced ? "200px" : "120px"}
                                />
                            </DialogField>
                        </div>
                    </div>

                    {/* Preview Column (Advanced only) */}
                    <div className={`flex flex-col bg-black/20 overflow-hidden transition-all duration-500 ease-in-out ${isAdvanced ? "w-[45%] opacity-100" : "w-0 opacity-0 px-0 pointer-events-none"}`}>
                        <div className="flex-1 flex flex-col p-6 overflow-y-auto custom-scrollbar min-w-[300px]">
                            <div className="sticky top-0 z-10 flex items-center gap-2 mb-6 text-[10px] font-black uppercase tracking-[0.2em] text-textMuted">
                                <Eye size={10} className="text-primary" />
                                {t("livePreview")}
                            </div>
                            <div className="space-y-6">
                                <NewsCard
                                    {...previewItem}
                                    modName={formData.modTitle}
                                    modSlug={formData.modSlug}
                                    modVersion={formData.version}
                                    gameVersion={formData.gameVersion}
                                    tags={previewItem.newscatTag ? [previewItem.newscatTag as any] : []}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-5 border-t border-white/5">
                    <DialogButton onClick={onClose} variant="secondary">{tCommon("cancel")}</DialogButton>
                    <DialogButton
                        onClick={handleSave}
                        variant="primary"
                        loading={isSaving}
                        className="min-w-[140px]"
                    >
                        <Save size={18} />
                        {isVersionChanged ? t("publishUpdate") : t("publishStatusChange")}
                    </DialogButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
