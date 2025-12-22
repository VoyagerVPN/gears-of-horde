"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Pencil, Trash2, ExternalLink, AlertTriangle } from "lucide-react";
import { NewsItem } from "@/schemas/news.schema";
import { deleteNews } from "@/app/actions/news-actions";
import EditNewsModal from "@/components/news/EditNewsModal";
import DateDisplay from "@/components/DateDisplay";
import Tag from "@/components/ui/Tag";
import { getTagColor } from "@/lib/tag-colors";
import { useRouter } from "next/navigation";

interface NewsManagementClientProps {
    initialNews: NewsItem[];
}

export default function NewsManagementClient({ initialNews }: NewsManagementClientProps) {
    const t = useTranslations("Admin");
    const router = useRouter();

    const [news, setNews] = useState<NewsItem[]>(initialNews);
    const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        if (!confirm(t("deleteNewsConfirm"))) return;

        setDeletingId(id);
        try {
            const result = await deleteNews(id);
            if (result.success) {
                setNews((prev) => prev.filter((item) => item.id !== id));
            }
        } finally {
            setDeletingId(null);
        }
    };

    const handleSaved = () => {
        router.refresh();
    };

    if (news.length === 0) {
        return (
            <div className="text-center py-20 border border-dashed border-white/10 rounded-xl bg-white/[0.02]">
                <p className="text-textMuted">{t("noNewsFound")}</p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-3">
                {news.map((item) => {
                    const primaryTag = item.tags.find((t) => t.category === "newscat") || item.tags[0];
                    const stripeColor = primaryTag
                        ? getTagColor(primaryTag.category || "tag", primaryTag.displayName, primaryTag.color)
                        : "#a1a1a1";

                    return (
                        <div
                            key={item.id}
                            className="relative flex w-full bg-surface rounded-lg overflow-hidden border border-white/5 hover:border-white/10 transition-colors group"
                        >
                            {/* Left Stripe */}
                            <div
                                className="w-1.5 flex-shrink-0"
                                style={{ background: stripeColor }}
                            />

                            {/* Content */}
                            <div className="flex-1 p-4">
                                {/* Header Row */}
                                <div className="flex items-start justify-between gap-4 mb-2">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-white text-sm line-clamp-1">
                                            {item.modName}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1 text-xs text-textMuted">
                                            {item.modVersion && (
                                                <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded">
                                                    {item.modVersion}
                                                </span>
                                            )}
                                            <span>{item.actionText}</span>
                                            <DateDisplay date={item.date} className="font-mono" />
                                            {item.wipeRequired && (
                                                <span className="flex items-center gap-1 text-amber-500">
                                                    <AlertTriangle size={12} />
                                                    WIPE
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {item.modSlug && (
                                            <a
                                                href={`/${item.modSlug}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 text-textMuted hover:text-white hover:bg-white/10 rounded transition-colors"
                                                title="View Mod"
                                            >
                                                <ExternalLink size={16} />
                                            </a>
                                        )}
                                        <button
                                            onClick={() => setEditingNews(item)}
                                            className="p-2 text-textMuted hover:text-primary hover:bg-primary/10 rounded transition-colors"
                                            title={t("edit")}
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            disabled={deletingId === item.id}
                                            className="p-2 text-textMuted hover:text-red-500 hover:bg-red-500/10 rounded transition-colors disabled:opacity-50"
                                            title={t("delete")}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Description/Content Preview */}
                                {(item.description || item.content) && (
                                    <p className="text-xs text-textMuted line-clamp-2 mb-2">
                                        {item.description || item.content}
                                    </p>
                                )}

                                {/* Tags */}
                                {item.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {item.tags.slice(0, 4).map((tag, idx) => (
                                            <Tag
                                                key={tag.displayName + idx}
                                                category={tag.category}
                                                color={tag.color || undefined}
                                            >
                                                {tag.displayName?.toLowerCase()}
                                            </Tag>
                                        ))}
                                        {item.tags.length > 4 && (
                                            <span className="text-[10px] text-textMuted">
                                                +{item.tags.length - 4}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Edit Modal */}
            <EditNewsModal
                news={editingNews}
                isOpen={!!editingNews}
                onClose={() => setEditingNews(null)}
                onSaved={handleSaved}
            />
        </>
    );
}
