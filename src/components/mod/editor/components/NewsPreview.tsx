"use client";

import { useTranslations } from "next-intl";
import { Eye } from "lucide-react";
import NewsCard from "@/components/NewsCard";
import { FrozenTag } from "@/schemas/news.schema";

interface NewsPreviewProps {
    modTitle: string;
    modSlug: string;
    version: string;
    gameVersion: string;
    status: string;
    content: string;
    date: string;
    wipeRequired: boolean;
    sourceUrl: string;
    newscatTag?: FrozenTag;
}

export default function NewsPreview({
    modTitle,
    modSlug,
    version,
    gameVersion,
    content,
    date,
    wipeRequired,
    sourceUrl,
    newscatTag
}: NewsPreviewProps) {
    const t = useTranslations('UnifiedUpdateModal');

    return (
        <div className="flex-1 flex flex-col p-6 overflow-y-auto custom-scrollbar min-w-[300px]">
            <div className="sticky top-0 z-10 flex items-center gap-2 mb-6 text-[10px] font-black uppercase tracking-[0.2em] text-textMuted">
                <Eye size={10} className="text-primary" />
                {t("livePreview")}
            </div>
            <div className="space-y-6">
                <NewsCard
                    modName={modTitle}
                    modSlug={modSlug}
                    modVersion={version}
                    gameVersion={gameVersion}
                    content={content}
                    date={date}
                    wipeRequired={wipeRequired}
                    sourceUrl={sourceUrl}
                    tags={newscatTag ? [{
                        id: newscatTag.id ?? '',
                        displayName: newscatTag.displayName,
                        color: newscatTag.color ?? undefined,
                        category: newscatTag.category ?? 'newscat'
                    }] : []}
                />
            </div>
        </div>
    );
}
