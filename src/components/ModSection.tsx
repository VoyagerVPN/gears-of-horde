"use client";

import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { RefreshCw, Flame, Star, ChevronRight, LucideIcon } from "lucide-react";
import ModCard from "@/components/ModCard";
import { ModData } from "@/types/mod";
import { cn } from "@/lib/utils";

interface ModSectionProps {
    children: React.ReactNode;
    className?: string;
}

export function ModSectionRoot({ children, className }: ModSectionProps) {
    return (
        <section className={cn("bg-surface/50 border border-white/5 rounded-3xl overflow-hidden", className)}>
            {children}
        </section>
    );
}

const iconMap: Record<string, LucideIcon> = {
    updated: RefreshCw,
    featured: Flame,
    topRated: Star
};

export function ModSectionHeader({ 
    title, 
    iconType, 
    viewAllHref 
}: { 
    title: string, 
    iconType: string, 
    viewAllHref: string 
}) {
    const t = useTranslations('HomePage');
    const Icon = iconMap[iconType] || RefreshCw;

    return (
        <div className="w-full flex items-center justify-between p-6 bg-white/[0.02] border-b border-white/5">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="text-primary" size={20} />
                </div>
                <h2 className="text-xl font-bold text-white font-exo2 uppercase tracking-wider">
                    {title}
                </h2>
            </div>

            <Link
                href={viewAllHref}
                className="flex items-center gap-2 text-xs font-bold text-textMuted hover:text-primary transition-colors uppercase tracking-widest group"
            >
                {t('viewAll')}
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
        </div>
    );
}

export function ModSectionGrid({ 
    mods, 
    locale 
}: { 
    mods: ModData[], 
    locale: 'en' | 'ru' 
}) {
    if (mods.length === 0) return (
        <div className="text-textMuted py-12 text-center text-sm italic">
            No mods found in this category
        </div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
            {mods.map((mod) => (
                <ModCard key={mod.slug} mod={mod} locale={locale} />
            ))}
        </div>
    );
}

// Re-export with clean names
export { ModSectionRoot as ModSection };
export default ModSectionRoot;
