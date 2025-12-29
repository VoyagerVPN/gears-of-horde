"use client";

import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { RefreshCw, Flame, Star, ChevronRight } from "lucide-react";
import ModCard from "@/components/ModCard";
import { ModData } from "@/types/mod";

// Map of icon names to components
const ICONS = {
    updated: RefreshCw,
    featured: Flame,
    topRated: Star
} as const;

type IconType = keyof typeof ICONS;

interface ModSectionProps {
    /** Section title key for translation (e.g., "recentlyUpdated") */
    titleKey: string;
    /** Icon type: 'updated' | 'featured' | 'topRated' */
    iconType: IconType;
    /** Array of mods to display (max 6) */
    mods: ModData[];
    /** Link for "View All" button with pre-selected sort */
    viewAllHref: string;
    /** Current locale */
    locale: 'en' | 'ru';
}

/**
 * Horizontal mod section with 2x3 grid layout for main page
 * Shows up to 6 mod cards with a header and "View All" link
 */
export default function ModSection({
    titleKey,
    iconType,
    mods,
    viewAllHref,
    locale
}: ModSectionProps) {
    const t = useTranslations("HomePage");
    const todayISO = new Date().toISOString();

    // Get icon component from map
    const Icon = ICONS[iconType];

    // Take max 6 mods
    const displayMods = mods.slice(0, 6);

    if (displayMods.length === 0) {
        return null;
    }

    return (
        <section className="mb-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Icon size={18} className="text-primary" />
                    <h2 className="text-2xl font-bold text-white uppercase tracking-widest font-exo2">
                        {t(titleKey)}
                    </h2>
                </div>
                <Link
                    href={viewAllHref}
                    className="flex items-center gap-1 text-xs text-textMuted hover:text-white transition-colors group"
                >
                    <span>{t("viewAll")}</span>
                    <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
            </div>

            {/* 2x3 Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayMods.map((mod) => (
                    <ModCard
                        key={mod.slug}
                        title={mod.title}
                        slug={mod.slug}
                        version={mod.version}
                        author={mod.author}
                        description={mod.description || ''}
                        tags={mod.tags}
                        updatedAt={mod.changelog?.[0]?.date || todayISO}
                        bannerUrl={mod.bannerUrl}
                        stats={{
                            rating: mod.stats.rating,
                            downloads: mod.stats.downloads,
                            views: mod.stats.views || '0'
                        }}
                        locale={locale}
                        status={mod.status}
                    />
                ))}
            </div>
        </section>
    );
}
