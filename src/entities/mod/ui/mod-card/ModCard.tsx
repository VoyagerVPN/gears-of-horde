"use client";

import { Link } from "@/i18n/routing";
import DOMPurify from 'isomorphic-dompurify';
import type { ModCardProps } from './types';
import type { ModTag } from '../../model/types';
import ModCardBanner from './ModCardBanner';
import ModCardStats from './ModCardStats';
import VersionTag from "@/components/VersionTag";
import Tag from "@/components/ui/Tag";

// Helper components (can be extracted later)
function AuthorPopover({ mainAuthor, additionalAuthors }: { mainAuthor: string; additionalAuthors: ModTag[] }) {
    if (additionalAuthors.length === 0) {
        return (
            <Tag category="author" value={mainAuthor} showIcon={true} href={`/mods?author=${encodeURIComponent(mainAuthor)}`}>
                {mainAuthor}
            </Tag>
        );
    }
    return (
        <div className="relative pr-7">
            <span className="absolute top-0 bottom-0 right-0 w-10 bg-cyan-400/10 border border-cyan-400/20 rounded-md rounded-l-none border-l-0 overflow-hidden cursor-default z-0">
                <span className="w-full h-full flex items-center justify-end pr-2 text-[13px] font-bold text-cyan-400">
                    +{additionalAuthors.length}
                </span>
            </span>
            <div className="relative z-10 bg-surface rounded-md">
                <Tag category="author" value={mainAuthor} showIcon={true} href={`/mods?author=${encodeURIComponent(mainAuthor)}`}>
                    {mainAuthor}
                </Tag>
            </div>
        </div>
    );
}

function TagsPopover({ tags }: { tags: ModTag[] }) {
    const normalTags = tags.slice(0, 9);
    const lastVisibleTag = tags[9];
    const hiddenTags = tags.slice(10);
    
    return (
        <div className="flex flex-wrap gap-1 items-start content-start relative z-20">
            {normalTags.map(tag => (
                <Tag key={tag.id || tag.displayName} color={tag.color || undefined} category={tag.category} href={`/mods?tags=${encodeURIComponent(tag.displayName)}`}>
                    {tag.displayName}
                </Tag>
            ))}
            {lastVisibleTag && (
                <div className={`relative ${hiddenTags.length > 0 ? 'pr-7' : ''}`}>
                    {hiddenTags.length > 0 && (
                        <span className="absolute top-0 bottom-0 right-0 w-10 bg-white/[0.025] border border-white/10 rounded-md rounded-l-none border-l-0 overflow-hidden cursor-default z-0">
                            <span className="w-full h-full flex items-center justify-end pr-2 text-[13px] font-bold text-textMuted">
                                +{hiddenTags.length}
                            </span>
                        </span>
                    )}
                    <div className="relative z-10 bg-surface rounded-md">
                        <Tag color={lastVisibleTag.color || undefined} category={lastVisibleTag.category} href={`/mods?tags=${encodeURIComponent(lastVisibleTag.displayName)}`}>
                            {lastVisibleTag.displayName}
                        </Tag>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function ModCard({ mod, locale = 'en' }: ModCardProps) {
    const authorTags = mod.tags.filter(t => t.category === 'author');
    const genericTags = mod.tags.filter(t => t.category === 'tag');
    const gameVerTag = mod.tags.find(t => t.category === 'gamever');
    const statusTag = mod.tags.find(t => t.category === 'status');

    const mainAuthor = authorTags.length > 0 ? authorTags[0].displayName : mod.author;
    const additionalAuthors = authorTags.slice(1);

    return (
        <div className="group block h-full relative">
            <div className="bg-surface rounded-xl overflow-hidden border border-white/5 hover:border-primary/50 transition-colors duration-200 h-full flex flex-col">
                <ModCardBanner bannerUrl={mod.bannerUrl} title={mod.title} />

                <div className="p-2.5 flex-1 flex flex-col gap-1.5">
                    <h3 className="text-base font-bold text-white group-hover:text-primary transition-colors line-clamp-1 font-exo2 uppercase tracking-wide">
                        {mod.title}
                    </h3>

                    <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-textMuted relative z-20">
                        <AuthorPopover mainAuthor={mainAuthor} additionalAuthors={additionalAuthors} />

                        <div className="flex gap-1">
                            {gameVerTag && <VersionTag type="game" version={gameVerTag.displayName} color={gameVerTag.color || undefined} />}
                            <VersionTag type="mod" version={mod.version} />
                        </div>

                        <Tag category="status" value={mod.status} color={statusTag?.color || undefined} href={`/mods?status=${mod.status}`} showIcon={true}>
                            {mod.status}
                        </Tag>
                    </div>

                    <div className="w-full h-px bg-white/5" />

                    <TagsPopover tags={genericTags} />

                    <div
                        className="text-[11px] text-textMuted leading-relaxed line-clamp-2 prose prose-invert prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(mod.description || '') }}
                    />
                </div>

                <ModCardStats
                    rating={mod.stats.rating}
                    downloads={mod.stats.downloads}
                    views={mod.stats.views}
                    updatedAt={mod.updatedAt}
                    locale={locale}
                />
            </div>

            <Link href={`/mods/${mod.slug}`} className="absolute inset-0 z-10" aria-label={`View ${mod.title}`} />
        </div>
    );
}
