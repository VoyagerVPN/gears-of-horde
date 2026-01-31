"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Trash2 } from "lucide-react";
import { NewsItem } from "@/schemas/news.schema";
import { deleteNews } from "@/app/actions/news-actions";
import UnifiedUpdateModal from "@/components/mod/UnifiedUpdateModal";
import NewsCard from "@/components/NewsCard";
import { useRouter } from "next/navigation";
import ConfirmModal from "@/components/ui/ConfirmModal";

interface NewsManagementClientProps {
    initialNews: NewsItem[];
    locale?: 'en' | 'ru';
}

export default function NewsManagementClient({ initialNews, locale = 'en' }: NewsManagementClientProps) {
    const t = useTranslations("Admin");
    const router = useRouter();

    const [news, setNews] = useState<NewsItem[]>(initialNews);
    const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    const handleDeleteClick = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        setConfirmDeleteId(id);
    };

    const handleConfirmDelete = async () => {
        if (!confirmDeleteId) return;

        setDeletingId(confirmDeleteId);
        try {
            const result = await deleteNews(confirmDeleteId);
            if (result.success) {
                setNews((prev) => prev.filter((item) => item.id !== confirmDeleteId));
            }
        } finally {
            setDeletingId(null);
            setConfirmDeleteId(null);
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
                {news.map((item) => (
                    <div key={item.id} className="relative group">
                        <NewsCard
                            modName={item.modName}
                            modSlug={item.modSlug}
                            modVersion={item.modVersion}
                            gameVersion={item.gameVersion}
                            actionText={item.actionText}
                            description={item.description}
                            content={item.content}
                            date={item.date}
                            tags={item.tags}
                            wipeRequired={item.wipeRequired}
                            sourceUrl={item.sourceUrl}
                            locale={locale}
                            onEdit={() => setEditingNews(item)}
                        />
                        {/* Delete button overlay */}
                        <button
                            onClick={(e) => handleDeleteClick(e, item.id)}
                            disabled={deletingId === item.id}
                            className="absolute top-2 right-12 z-20 p-1.5 bg-black/50 hover:bg-red-500/80 text-white/70 hover:text-white rounded transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                            title={t("delete")}
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}
            </div>

            {/* Edit Modal */}
            <UnifiedUpdateModal
                news={editingNews || undefined}
                isOpen={!!editingNews}
                onClose={() => setEditingNews(null)}
                onSaved={handleSaved}
            />

            <ConfirmModal
                isOpen={!!confirmDeleteId}
                onClose={() => setConfirmDeleteId(null)}
                onConfirm={handleConfirmDelete}
                title={t('deleteNews')}
                message={t('deleteNewsConfirm')}
                confirmText={t('delete')}
                cancelText={t('cancel')}
                variant="danger"
            />
        </>
    );
}

