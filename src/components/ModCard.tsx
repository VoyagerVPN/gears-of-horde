"use client";

import { useState, useRef } from "react";
import { Link } from "@/i18n/routing";
import { useTranslations } from 'next-intl';
import Image from "next/image";
import { Star, Download, Calendar, Eye, CircleUser } from "lucide-react";
import DateDisplay from "@/components/DateDisplay";
import VersionTag from "@/components/VersionTag";
import Tag from "@/components/ui/Tag";
import { TagData, ModStatusType } from "@/types/mod";
import { STATUS_CONFIG } from "@/lib/mod-constants";
import DOMPurify from 'isomorphic-dompurify';

interface ModCardProps {
  title: string;
  slug: string;
  version: string;
  author: string;
  description: string;
  tags: TagData[];
  updatedAt: string;
  bannerUrl?: string;
  stats: {
    rating: number;
    downloads: string;
    views: string;
  };
  locale?: 'en' | 'ru';
  status?: ModStatusType;
}

export default function ModCard({
  title,
  slug,
  version,
  author,
  description,
  tags = [],
  updatedAt,
  bannerUrl,
  stats,
  locale = 'en',
  status = 'active'
}: ModCardProps) {
  const t = useTranslations('ModCard');
  const tCommon = useTranslations('Common');

  // Get status config for icon and label
  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.unknown;
  const StatusIcon = statusConfig.icon;

  // State for popovers
  const [authorsPopoverOpen, setAuthorsPopoverOpen] = useState(false);
  const [tagsPopoverOpen, setTagsPopoverOpen] = useState(false);

  // Timeouts for hover interaction
  const authorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tagTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleAuthorEnter = () => {
    if (authorTimeoutRef.current) clearTimeout(authorTimeoutRef.current);
    setAuthorsPopoverOpen(true);
  };

  const handleAuthorLeave = () => {
    authorTimeoutRef.current = setTimeout(() => {
      setAuthorsPopoverOpen(false);
    }, 150);
  };

  const handleTagEnter = () => {
    if (tagTimeoutRef.current) clearTimeout(tagTimeoutRef.current);
    setTagsPopoverOpen(true);
  };

  const handleTagLeave = () => {
    tagTimeoutRef.current = setTimeout(() => {
      setTagsPopoverOpen(false);
    }, 150);
  };

  // Extract tags by category
  const authorTags = tags.filter(t => t.category === 'author');
  const genericTags = tags.filter(t => t.category === 'tag');
  const gameVerTag = tags.find(t => t.category === 'gamever');

  // Author display logic
  const mainAuthor = authorTags.length > 0 ? authorTags[0].displayName : author;
  const additionalAuthors = authorTags.slice(1);
  const hasMultipleAuthors = additionalAuthors.length > 0;

  // Tags display logic - first 9 shown normally, 10th has sliver behind it
  const normalTags = genericTags.slice(0, 9);
  const lastVisibleTag = genericTags[9]; // The tag that will have sliver behind
  const hiddenTags = genericTags.slice(10);
  const hasHiddenTags = hiddenTags.length > 0 && lastVisibleTag;

  return (
    <div className="group block h-full relative">
      <div className="bg-surface rounded-xl overflow-hidden border border-white/5 hover:border-primary/50 transition-colors duration-200 h-full flex flex-col">

        {/* HEADER / BANNER */}
        <div
          className="bg-zinc-900 relative overflow-hidden shrink-0"
          style={{ aspectRatio: '1000 / 219' }}
        >
          {bannerUrl ? (
            <Image
              src={bannerUrl}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 384px"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900" />
          )}

        </div>

        {/* CONTENT */}
        <div className="p-2.5 flex-1 flex flex-col gap-1.5">

          {/* Title */}
          <h3 className="text-base font-bold text-white group-hover:text-primary transition-colors line-clamp-1 font-exo2 uppercase tracking-wide">
            {title}
          </h3>

          {/* Author & Versions & Status Row */}
          <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-textMuted relative z-20">

            {/* Author Section with stacked cards effect */}
            <div className={`relative ${hasMultipleAuthors ? 'pr-7' : ''}`}>
              {/* Stacked sliver BEHIND - styled like a tag peeking out */}
              {hasMultipleAuthors && (
                <span
                  className="absolute top-0 bottom-0 right-0 w-10 bg-cyan-400/10 border border-cyan-400/20 rounded-md rounded-l-none border-l-0 overflow-hidden cursor-default z-0"
                  onMouseEnter={handleAuthorEnter}
                  onMouseLeave={handleAuthorLeave}
                >
                  <span className="w-full h-full flex items-center justify-end pr-2 text-[13px] font-bold text-cyan-400 hover:bg-white/10 transition-colors">
                    +{additionalAuthors.length}
                  </span>
                </span>
              )}

              {/* Main Author Tag - ON TOP with surface background to mask sliver */}
              <div className="relative z-10 bg-surface rounded-md">
                <Tag
                  category="author"
                  value={mainAuthor} // Pass value for potential specific color/icon logic
                  showIcon={true}
                  href={`/mods?author=${encodeURIComponent(mainAuthor)}`}
                >
                  {mainAuthor}
                </Tag>
              </div>

              {/* Tooltip with additional authors */}
              {authorsPopoverOpen && (
                <div
                  className="absolute bottom-full right-0 mb-1 z-50 bg-surface border border-white/10 rounded-lg shadow-xl p-2 min-w-[120px]"
                  onMouseEnter={handleAuthorEnter}
                  onMouseLeave={handleAuthorLeave}
                >
                  <div className="flex flex-col gap-1">
                    {additionalAuthors.map((authorTag) => (
                      <Tag
                        key={authorTag.displayName}
                        category="author"
                        value={authorTag.displayName}
                        showIcon={true}
                        href={`/mods?author=${encodeURIComponent(authorTag.displayName)}`}
                      >
                        {authorTag.displayName}
                      </Tag>
                    ))}
                  </div>
                  {/* Arrow */}
                  <div className="absolute top-full right-3 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white/10" />
                </div>
              )}
            </div>

            {/* Versions */}
            <div className="flex gap-1">
              {gameVerTag && (
                <VersionTag type="game" version={gameVerTag.displayName} color={gameVerTag.color || undefined} />
              )}
              <VersionTag type="mod" version={version} />
            </div>

            {/* Status Tag */}
            {(() => {
              const dbStatusTag = tags.find(t => t.category === 'status');
              return (
                <Tag
                  category="status"
                  value={status}
                  color={dbStatusTag?.color || undefined}
                  href={`/mods?status=${status}`}
                  showIcon={true}
                >
                  {tCommon(`statuses.${status}`)}
                </Tag>
              );
            })()}
          </div>

          {/* Divider between meta row and tags */}
          <div className="w-full h-px bg-white/5" />

          {/* Tags Section */}
          <div className="flex flex-wrap gap-1 items-start content-start relative z-20">
            {normalTags.map(tag => (
              <Tag
                key={tag.id || tag.displayName}
                color={tag.color || undefined}
                category={tag.category}
                href={`/mods?tags=${encodeURIComponent(tag.displayName)}`}
              >
                {tag.displayName}
              </Tag>
            ))}

            {/* Last visible tag with stacked sliver behind it */}
            {lastVisibleTag && (
              <div className={`relative ${hasHiddenTags ? 'pr-7' : ''}`}>
                {/* Stacked sliver BEHIND - styled like a tag peeking out */}
                {hasHiddenTags && (
                  <span
                    className="absolute top-0 bottom-0 right-0 w-10 bg-white/[0.025] border border-white/10 rounded-md rounded-l-none border-l-0 overflow-hidden cursor-default z-0"
                    onMouseEnter={handleTagEnter}
                    onMouseLeave={handleTagLeave}
                  >
                    <span className="w-full h-full flex items-center justify-end pr-2 text-[13px] font-bold text-textMuted hover:bg-white/10 transition-colors">
                      +{hiddenTags.length}
                    </span>
                  </span>
                )}

                {/* Last visible tag - ON TOP with solid background */}
                <div className="relative z-10 bg-surface rounded-md">
                  <Tag
                    color={lastVisibleTag.color || undefined}
                    category={lastVisibleTag.category}
                    href={`/mods?tags=${encodeURIComponent(lastVisibleTag.displayName)}`}
                  >
                    {lastVisibleTag.displayName}
                  </Tag>
                </div>

                {/* Tooltip with hidden tags */}
                {tagsPopoverOpen && (
                  <div
                    className="absolute bottom-full right-0 mb-1 z-50 bg-surface border border-white/10 rounded-lg shadow-xl p-2 min-w-[120px]"
                    onMouseEnter={handleTagEnter}
                    onMouseLeave={handleTagLeave}
                  >
                    <div className="flex flex-col gap-1">
                      {hiddenTags.map(tag => (
                        <Tag
                          key={tag.id || tag.displayName}
                          color={tag.color || undefined}
                          category={tag.category}
                          href={`/mods?tags=${encodeURIComponent(tag.displayName)}`}
                        >
                          {tag.displayName}
                        </Tag>
                      ))}
                    </div>
                    {/* Arrow */}
                    <div className="absolute top-full right-3 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white/10" />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Description - rendered with prose styling and sanitized */}
          <div
            className="text-[11px] text-textMuted leading-relaxed line-clamp-2 prose prose-invert prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(description || t('noDescription')) }}
          />

        </div>

        {/* FOOTER */}
        <div className="bg-black/20 px-3 py-1.5 border-t border-white/5 flex items-center justify-between text-[10px] text-textMuted mt-auto">
          <div className="flex gap-3">
            <span className="flex items-center gap-1.5 text-white font-bold">
              <Star size={14} className="text-yellow-500 fill-yellow-500" />
              {stats.rating.toFixed(1)}
            </span>
            <span className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Download size={14} /> {stats.downloads}
            </span>
            <span className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Eye size={14} /> {stats.views}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Calendar size={14} />
            <DateDisplay date={updatedAt} locale={locale} />
          </div>
        </div>

      </div>

      {/* Main Card Link - Overlay */}
      <Link href={`/mods/${slug}`} className="absolute inset-0 z-10" aria-label={`View ${title}`} />
    </div>
  );
}