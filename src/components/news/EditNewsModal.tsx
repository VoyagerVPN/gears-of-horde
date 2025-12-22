"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogBody,
    DialogFooter,
    DialogButton,
    DialogField,
    dialogInputClass,
} from "@/components/ui/Dialog";
import { updateNews } from "@/app/actions/news-actions";
import { NewsItem as NewsItemType, FrozenTag } from "@/schemas/news.schema";
import { AlertTriangle, Eye } from "lucide-react";
import NewsItem from "@/components/NewsItem";

interface EditNewsModalProps {
    news: NewsItemType | null;
    isOpen: boolean;
    onClose: () => void;
    onSaved: () => void;
}

export default function EditNewsModal({
    news,
    isOpen,
    onClose,
    onSaved,
}: EditNewsModalProps) {
    const t = useTranslations("Admin");
    const tCommon = useTranslations("Common");

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<NewsItemType>>({});
    const [previewMode, setPreviewMode] = useState<'list' | 'card'>('list');

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
                wipeRequired: news.wipeRequired,
                sourceUrl: news.sourceUrl,
                tags: news.tags,
            });
        } else if (isOpen && !news) {
            setFormData({});
        }
    }, [isOpen, news]);

    const currentData = {
        modName: formData.modName ?? "",
        modSlug: formData.modSlug ?? "",
        modVersion: formData.modVersion ?? "",
        gameVersion: formData.gameVersion ?? "",
        actionText: formData.actionText ?? "released",
        content: formData.content ?? "",
        description: formData.description ?? "",
        wipeRequired: formData.wipeRequired ?? false,
        sourceUrl: formData.sourceUrl ?? "",
        tags: formData.tags ?? news?.tags ?? [],
    };

    const handleChange = (field: keyof NewsItemType, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!news) return;

        setLoading(true);
        try {
            const result = await updateNews(news.id, {
                modName: currentData.modName,
                modSlug: currentData.modSlug,
                modVersion: currentData.modVersion || undefined,
                gameVersion: currentData.gameVersion || undefined,
                actionText: currentData.actionText,
                content: currentData.content,
                description: currentData.description || undefined,
                wipeRequired: currentData.wipeRequired,
                sourceUrl: currentData.sourceUrl || undefined,
                tags: currentData.tags,
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

    // Construct preview item
    const previewItem: NewsItemType = {
        id: "preview",
        date: new Date().toISOString(), // Current date for preview
        ...currentData,
    };

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
                            disabled={!currentData.modName || !currentData.content}
                        >
                            {t("save")}
                        </DialogButton>
                    </div>
                </div>

                <div className="flex flex-1 min-h-0 overflow-hidden">
                    {/* === LEFT COLUMN: EDITOR === */}
                    <div className="w-[55%] flex flex-col border-r border-white/5 overflow-y-auto custom-scrollbar">
                        <div className="p-5 space-y-4">
                            {/* Metadata Group */}
                            <div className="grid grid-cols-2 gap-3">
                                <DialogField label={t("modName")} smallLabel required className="col-span-2">
                                    <input
                                        type="text"
                                        className={dialogInputClass}
                                        value={currentData.modName}
                                        onChange={(e) => handleChange("modName", e.target.value)}
                                        placeholder="Mod Name"
                                    />
                                </DialogField>

                                <DialogField label={tCommon("modVersion")} smallLabel>
                                    <input
                                        type="text"
                                        className={dialogInputClass}
                                        value={currentData.modVersion}
                                        onChange={(e) => handleChange("modVersion", e.target.value)}
                                        placeholder="e.g. 1.0.0"
                                    />
                                </DialogField>
                                <DialogField label={tCommon("gameVersion")} smallLabel>
                                    <input
                                        type="text"
                                        className={dialogInputClass}
                                        value={currentData.gameVersion}
                                        onChange={(e) => handleChange("gameVersion", e.target.value)}
                                        placeholder="e.g. V2.6"
                                    />
                                </DialogField>

                                <DialogField label="Action Text" smallLabel>
                                    <input
                                        type="text"
                                        className={dialogInputClass}
                                        value={currentData.actionText}
                                        onChange={(e) => handleChange("actionText", e.target.value)}
                                        placeholder="released"
                                    />
                                </DialogField>
                                <DialogField label={tCommon("url")} smallLabel>
                                    <input
                                        type="url"
                                        className={dialogInputClass}
                                        value={currentData.sourceUrl}
                                        onChange={(e) => handleChange("sourceUrl", e.target.value)}
                                        placeholder="https://..."
                                    />
                                </DialogField>
                            </div>

                            {/* Wipe Required Toggle */}
                            <label className="flex items-center gap-3 p-3 bg-black/20 border border-white/10 rounded-lg cursor-pointer hover:bg-black/30 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={currentData.wipeRequired}
                                    onChange={(e) => handleChange("wipeRequired", e.target.checked)}
                                    className="w-4 h-4 accent-amber-500"
                                />
                                <AlertTriangle size={16} className="text-amber-500" />
                                <span className="text-sm text-white font-medium">
                                    {tCommon("wipeRequired")}
                                </span>
                            </label>

                            {/* Separator */}
                            <div className="h-px bg-white/5" />

                            {/* Description */}
                            <DialogField label="Description" smallLabel>
                                <textarea
                                    className={`${dialogInputClass} resize-y min-h-[60px]`}
                                    rows={2}
                                    value={currentData.description}
                                    onChange={(e) => handleChange("description", e.target.value)}
                                    placeholder="Short description for news feed (optional)"
                                />
                            </DialogField>

                            {/* Main Content Editor */}
                            <DialogField label="Content" smallLabel required>
                                <textarea
                                    className={`${dialogInputClass} resize-y min-h-[150px] font-mono`}
                                    rows={6}
                                    value={currentData.content}
                                    onChange={(e) => handleChange("content", e.target.value)}
                                    placeholder="# Write your news content here..."
                                />
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
                            <div className="flex bg-black/40 rounded-md p-0.5 border border-white/5">
                                <button
                                    type="button"
                                    onClick={() => setPreviewMode('list')}
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${previewMode === 'list' ? 'bg-white/10 text-white' : 'text-textMuted hover:text-white'}`}
                                >
                                    List
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPreviewMode('card')}
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${previewMode === 'card' ? 'bg-white/10 text-white' : 'text-textMuted hover:text-white'}`}
                                >
                                    Card
                                </button>
                            </div>
                        </div>

                        {/* Preview Body */}
                        <div className="flex-1 p-4 overflow-y-auto">
                            <div className="w-full">
                                <NewsItem
                                    {...previewItem}
                                    variant={previewMode}
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
