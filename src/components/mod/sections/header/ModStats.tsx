"use client";

import { Star, Eye, Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { ModStatusType } from "@/types/mod";
import StatusSelector from "./StatusSelector";

interface ModStatsProps {
    rating: number;
    views: string;
    downloads: string;
    status: ModStatusType;
    initialStatus?: ModStatusType;
    isEditing?: boolean;
    onStatusChange?: (status: ModStatusType) => void;
}

export default function ModStats({
    rating,
    views,
    downloads,
    status,
    initialStatus,
    isEditing,
    onStatusChange
}: ModStatsProps) {
    const t = useTranslations('Common');

    return (
        <div className="flex items-center bg-surface rounded-lg border border-white/5 divide-x divide-white/10 shadow-sm shrink-0">
            <StatusSelector
                status={status}
                initialStatus={initialStatus}
                onChange={isEditing ? onStatusChange : undefined}
            />

            <div className="px-5 py-3 text-center min-w-[100px]">
                <div className="flex items-center gap-1.5 justify-center text-yellow-500 mb-0.5">
                    <Star size={18} fill="currentColor" />
                    <span className="text-xl font-bold text-white">{rating}</span>
                </div>
                <div className="text-[10px] text-textMuted uppercase tracking-wider font-exo2">
                    {t('rating')}
                </div>
            </div>

            <div className="px-5 py-3 text-center min-w-[100px]">
                <div className="flex items-center gap-1.5 justify-center text-textMuted mb-0.5">
                    <Eye size={18} />
                    <span className="text-xl font-bold text-white">{views}</span>
                </div>
                <div className="text-[10px] text-textMuted uppercase tracking-wider font-exo2">{t('views')}</div>
            </div>

            <div className="px-5 py-3 text-center min-w-[100px]">
                <div className="flex items-center gap-1.5 justify-center text-primary mb-0.5">
                    <Download size={18} />
                    <span className="text-xl font-bold text-white">{downloads}</span>
                </div>
                <div className="text-[10px] text-textMuted uppercase tracking-wider font-exo2">{t('downloads')}</div>
            </div>
        </div>
    );
}
