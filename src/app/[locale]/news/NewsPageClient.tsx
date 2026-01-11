"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import NewsCard from "@/components/NewsCard";
import UnifiedUpdateModal from "@/components/mod/UnifiedUpdateModal";
import { NewsItem } from "@/schemas/news.schema";

interface NewsPageClientProps {
    news: NewsItem[];
    locale: 'en' | 'ru';
    isAdmin: boolean;
}

export default function NewsPageClient({ news, locale, isAdmin }: NewsPageClientProps) {
    const router = useRouter();
    const [editingNews, setEditingNews] = useState<NewsItem | null>(null);

    const handleSaved = () => {
        router.refresh();
    };

    return (
        <>
            {news.length > 0 ? (
                news.map((item) => (
                    <NewsCard
                        key={item.id}
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
                        onEdit={isAdmin ? () => setEditingNews(item) : undefined}
                    />
                ))
            ) : (
                <div className="col-span-full text-center py-20 border border-dashed border-white/10 rounded-xl bg-white/[0.02]">
                    <p className="text-textMuted">No news found</p>
                </div>
            )}

            {isAdmin && (
                <UnifiedUpdateModal
                    news={editingNews || undefined}
                    isOpen={!!editingNews}
                    onClose={() => setEditingNews(null)}
                    onSaved={handleSaved}
                />
            )}
        </>
    );
}
