"use client";

import { Link } from "@/i18n/routing";
import { useTranslations } from 'next-intl';
import DOMPurify from 'isomorphic-dompurify';

import { ModData } from "@/types/mod";
import VersionTag from "@/components/VersionTag";

import ModCardBanner from "./mod/card/ModCardBanner";
import AuthorPopover from "./mod/card/AuthorPopover";
import TagsPopover from "./mod/card/TagsPopover";
import ModCardStats from "./mod/card/ModCardStats";
import ModCardStatus from "./mod/card/ModCardStatus";

interface ModCardProps {
    mod: ModData;
    locale?: 'en' | 'ru';
}

export default function ModCard({
    mod,
    locale = 'en'
}: ModCardProps) {
    const {
        title,
        slug,
        version,
        author,
        description,
        tags = [],
        updatedAt,
        bannerUrl,
        stats,
        status = 'active'
    } = mod;
    const t = useTranslations('ModCard');

    // Extract tags by category
    const authorTags = tags.filter(t => t.category === 'author');
    const genericTags = tags.filter(t => t.category === 'tag');
    const gameVerTag = tags.find(t => t.category === 'gamever');

    const mainAuthor = authorTags.length > 0 ? authorTags[0].displayName : author;
    const additionalAuthors = authorTags.slice(1);

    return (
        <div className="group block h-full relative">
            <div className="bg-surface rounded-xl overflow-hidden border border-white/5 hover:border-primary/50 transition-colors duration-200 h-full flex flex-col">
                <ModCardBanner bannerUrl={bannerUrl} title={title} />

                <div className="p-2.5 flex-1 flex flex-col gap-1.5">
                    <h3 className="text-base font-bold text-white group-hover:text-primary transition-colors line-clamp-1 font-exo2 uppercase tracking-wide">
                        {title}
                    </h3>

                    <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-textMuted relative z-20">
                        <AuthorPopover mainAuthor={mainAuthor} additionalAuthors={additionalAuthors} />

                        <div className="flex gap-1">
                            {gameVerTag && (
                                <VersionTag type="game" version={gameVerTag.displayName} color={gameVerTag.color || undefined} />
                            )}
                            <VersionTag type="mod" version={version} />
                        </div>

                        <ModCardStatus status={status} tags={tags} />
                    </div>

                    <div className="w-full h-px bg-white/5" />

                    <TagsPopover tags={genericTags} />

                    <div
                        className="text-[11px] text-textMuted leading-relaxed line-clamp-2 prose prose-invert prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(description || t('noDescription')) }}
                    />
                </div>

                <ModCardStats
                    rating={stats.rating}
                    downloads={stats.downloads}
                    views={stats.views}
                    updatedAt={updatedAt || new Date().toISOString()}
                    locale={locale}
                />
            </div>

            <Link href={`/mods/${slug}`} className="absolute inset-0 z-10" aria-label={`View ${title}`} />
        </div>
    );
}
