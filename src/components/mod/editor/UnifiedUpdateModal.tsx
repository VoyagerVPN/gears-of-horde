"use client";

import { useState, useMemo, useEffect } from "react";
import { Save, LayoutGrid, Layout } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

import { DatePicker } from "@/shared/ui";
import GameVersionSelector from "@/components/ui/GameVersionSelector";
import { RichTextEditor } from "@/shared/ui";
import RichSelector from "@/components/ui/RichSelector";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
    DialogDescription, DialogFooter, DialogButton,
    DialogField, dialogInputClass
} from "@/shared/ui";

import { ModData, ModStatusType, TagData } from "@/types/mod";
import { updateNews, fetchNewsTags } from "@/app/actions/news-actions";
import { searchModsForSelector } from "@/app/actions/search-actions";
import { NewsItem, FrozenTag } from "@/schemas/news.schema";
import { STATUS_OPTIONS } from "@/lib/mod-constants";
import { getTagColor } from "@/lib/tag-colors";

import ModSelector from "./components/ModSelector";
import AutoSummary from "./components/AutoSummary";
import NewsPreview from "./components/NewsPreview";
import WipeRequiredCard from "./components/WipeRequiredCard";

interface UnifiedUpdateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaved?: () => void;
    onSave?: (data: any) => void;
    news?: NewsItem;
    mod?: ModData;
    gameVersionTags?: TagData[];
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

    const [isAdvanced, setIsAdvanced] = useState(!!news);
    const [isSaving, setIsSaving] = useState(false);
    const [newscatTags, setNewscatTags] = useState<FrozenTag[]>([]);
    const [newscatOverride, setNewscatOverride] = useState(!!news?.newscatTagId);

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

    useEffect(() => {
        fetchNewsTags().then(setNewscatTags);
    }, []);

    useEffect(() => {
        if (isOpen) {
            setFormData({
                modId: mod?.slug || "",
                modTitle: mod?.title || news?.modName || "",
                modSlug: mod?.slug || news?.modSlug || "",
                version: mod?.version || news?.modVersion || "",
                gameVersion: mod?.gameVersion || news?.gameVersion || "",
                status: mod?.status || (news?.tags?.find(t => t.category === 'status')?.displayName.toLowerCase() as ModStatusType) || "active",
                wipeRequired: news?.wipeRequired || false,
                date: news?.date || new Date().toISOString(),
                sourceUrl: news?.sourceUrl || "",
                content: news?.content || "",
                newscatTagId: news?.newscatTagId || "",
            });
            setNewscatOverride(!!news?.newscatTagId);
        }
    }, [isOpen, mod, news]);

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

    useEffect(() => {
        if (!newscatOverride && newscatTags.length > 0) {
            const autoTag = newscatTags.find(t => t.displayName.toLowerCase() === autoNewscatValue);
            if (autoTag && formData.newscatTagId !== autoTag.id) {
                setFormData(prev => ({ ...prev, newscatTagId: autoTag.id || "" }));
            }
        }
    }, [autoNewscatValue, newscatTags, newscatOverride, formData.newscatTagId]);

    const handleSave = async () => {
        if ((!formData.modId && !news?.id) || (!formData.content.trim() && !isVersionChanged)) return;

        setIsSaving(true);
        try {
            if (onSave) {
                const selectedTag = newscatTags.find(t => t.id === formData.newscatTagId);
                const logicSlug = selectedTag?.displayName?.toLowerCase() || "update";

                await onSave({
                    ...formData,
                    isSaveBreaking: formData.wipeRequired,
                    changes: [formData.content],
                    description: formData.content,
                    newscat: logicSlug
                });
            } else if (news?.id) {
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
            }
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const newscatOptions = newscatTags.map(tg => ({
        value: tg.id || "",
        label: tg.displayName,
        iconColor: getTagColor('newscat', tg.displayName.toLowerCase(), tg.color),
        labelColor: getTagColor('newscat', tg.displayName.toLowerCase(), tg.color),
    }));

    const statusOptions = STATUS_OPTIONS.map(opt => ({
        value: opt.value,
        label: tCommon(`statuses.${opt.value}`),
        iconColor: opt.color,
        labelColor: opt.color,
        icon: opt.icon
    }));

    const selectedNewscatTag = newscatTags.find(tg => tg.id === formData.newscatTagId);

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
                            <ModSelector
                                value={formData.modTitle}
                                onSelect={(m) => setFormData(prev => ({
                                    ...prev,
                                    modId: m.id,
                                    modTitle: m.title,
                                    modSlug: m.slug,
                                    version: m.version,
                                    gameVersion: m.gameVersion,
                                    status: m.status as ModStatusType
                                }))}
                                searchMods={searchModsForSelector}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <DialogField label={t("newsCategory")} smallLabel>
                                    <div className="relative group">
                                        <RichSelector
                                            value={formData.newscatTagId}
                                            options={newscatOptions}
                                            onChange={(val) => {
                                                setFormData(prev => ({ ...prev, newscatTagId: val }));
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
                                        onChange={(val) => setFormData(prev => ({ ...prev, status: val as ModStatusType }))}
                                        placeholder={t("status")}
                                    />
                                </DialogField>

                                <DialogField label={t("newVersion")} smallLabel>
                                    <input
                                        className={dialogInputClass}
                                        value={formData.version}
                                        onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                                        placeholder="1.0.0"
                                    />
                                </DialogField>

                                <DialogField label={t("gameVersion")} smallLabel>
                                    <GameVersionSelector
                                        value={formData.gameVersion}
                                        onChange={(val) => setFormData(prev => ({ ...prev, gameVersion: val }))}
                                        gameVersionTags={gameVersionTags}
                                        currentVersion={mod?.gameVersion || news?.gameVersion}
                                    />
                                </DialogField>

                                <DialogField label={t("releaseDate")} smallLabel>
                                    <DatePicker
                                        value={new Date(formData.date)}
                                        onChange={(d) => setFormData(prev => ({ ...prev, date: d?.toISOString() || new Date().toISOString() }))}
                                        locale={locale}
                                        className="w-full h-[42px] bg-black/20 border border-white/10 rounded-md justify-between px-3"
                                    />
                                </DialogField>

                                <DialogField label={t("source")} smallLabel>
                                    <div className="relative">
                                        <input
                                            className={dialogInputClass}
                                            value={formData.sourceUrl}
                                            onChange={(e) => setFormData(prev => ({ ...prev, sourceUrl: e.target.value }))}
                                            placeholder="https://..."
                                        />
                                    </div>
                                </DialogField>
                            </div>

                            <WipeRequiredCard
                                value={formData.wipeRequired}
                                onChange={(val) => setFormData(prev => ({ ...prev, wipeRequired: val }))}
                            />

                            <DialogField label={t("summary")} smallLabel>
                                <div className="px-4 py-3 bg-black/40 border border-white/5 rounded-xl text-sm min-h-[44px] flex items-center">
                                    <AutoSummary
                                        modTitle={formData.modTitle}
                                        version={formData.version}
                                        originalVersion={mod?.version || news?.modVersion || ""}
                                        status={formData.status}
                                        isVersionChanged={isVersionChanged}
                                    />
                                </div>
                            </DialogField>

                            <DialogField label={t("content")} smallLabel>
                                <RichTextEditor
                                    id="unified-content"
                                    value={formData.content}
                                    onChange={(val) => setFormData(prev => ({ ...prev, content: val }))}
                                    placeholder={t("contentPlaceholder")}
                                    minHeight={isAdvanced ? "200px" : "120px"}
                                />
                            </DialogField>
                        </div>
                    </div>

                    {/* Preview Column */}
                    <div className={`flex flex-col bg-black/20 overflow-hidden transition-all duration-500 ease-in-out ${isAdvanced ? "w-[45%] opacity-100" : "w-0 opacity-0 px-0 pointer-events-none"}`}>
                        <NewsPreview
                            modTitle={formData.modTitle}
                            modSlug={formData.modSlug}
                            version={formData.version}
                            gameVersion={formData.gameVersion}
                            status={formData.status}
                            content={formData.content}
                            date={formData.date}
                            wipeRequired={formData.wipeRequired}
                            sourceUrl={formData.sourceUrl}
                            newscatTag={selectedNewscatTag}
                        />
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
