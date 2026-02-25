"use client";

import { Star, Download, Eye, Calendar } from "lucide-react";
import DateDisplay from "@/components/DateDisplay";
import type { ModCardStatsProps } from './types';

export default function ModCardStats({ rating, downloads, views, updatedAt, locale = 'en' }: ModCardStatsProps) {
    return (
        <div className="bg-black/20 px-3 py-1.5 border-t border-white/5 flex items-center justify-between text-[10px] text-textMuted mt-auto">
            <div className="flex gap-3">
                <span className="flex items-center gap-1.5 text-white font-bold">
                    <Star size={14} className="text-yellow-500 fill-yellow-500" />
                    {rating.toFixed(1)}
                </span>
                <span className="flex items-center gap-1.5 hover:text-white transition-colors">
                    <Download size={14} /> {downloads}
                </span>
                <span className="flex items-center gap-1.5 hover:text-white transition-colors">
                    <Eye size={14} /> {views}
                </span>
            </div>

            <div className="flex items-center gap-1.5">
                <Calendar size={14} />
                <DateDisplay date={updatedAt} locale={locale} />
            </div>
        </div>
    );
}
