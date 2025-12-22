"use client";

import { Link } from "@/i18n/routing";
import { useTranslations } from 'next-intl';
import { Star, Download, Calendar, Eye } from "lucide-react";
import DateDisplay from "@/components/DateDisplay";
import VersionTag from "@/components/VersionTag";
import Tag from "@/components/ui/Tag";
import AuthorTag from "@/components/AuthorTag";
import { TagData } from "@/types/mod";

interface ModCardProps {
  title: string;
  slug: string;
  version: string;
  gameVersion: string;
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
}

export default function ModCard({
  title,
  slug,
  version,
  gameVersion,
  author,
  description,
  tags = [],
  updatedAt,
  bannerUrl,
  stats,
  locale = 'en'
}: ModCardProps) {
  const t = useTranslations('ModCard');

  // Find gamever tag to get database color (no displayName match needed - mod should have only one gamever tag)
  const gameVerTag = tags.find(t => t.category === 'gamever');

  return (
    <div className="group block h-full relative">
      <div className="bg-surface rounded-xl overflow-hidden border border-white/5 hover:border-primary/50 transition-colors duration-200 h-full flex flex-col">

        {/* HEADER / BANNER */}
        <div
          className="bg-zinc-900 relative overflow-hidden shrink-0"
          style={{ aspectRatio: '1000 / 219' }}
        >
          {bannerUrl ? (
            <img
              src={bannerUrl}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>

        {/* CONTENT */}
        <div className="p-3 flex-1 flex flex-col gap-2">

          {/* Title */}
          <h3 className="text-base font-bold text-white group-hover:text-primary transition-colors line-clamp-1 font-exo2 uppercase tracking-wide">
            {title}
          </h3>

          {/* Author & Versions Row */}
          <div className="flex items-center gap-2 flex-wrap text-[10px] text-textMuted relative z-20">
            {/* Author */}
            <div className="flex items-center gap-1">
              {tags.filter(t => t.category === 'author').length > 0 ? (
                tags.filter(t => t.category === 'author').map((authorTag) => (
                  <AuthorTag
                    key={authorTag.displayName}
                    author={authorTag.displayName}
                  />
                ))
              ) : (
                <AuthorTag author={author} />
              )}
            </div>

            {/* Vertical Divider */}
            <div className="w-px h-4 bg-white/20 self-center" />

            {/* Versions */}
            <div className="flex gap-1">
              <VersionTag type="game" version={gameVersion} color={gameVerTag?.color || undefined} />
              <VersionTag type="mod" version={version} />
            </div>
          </div>

          {/* Divider above Tags */}
          <div className="w-full h-px bg-white/5 my-0.5" />

          {/* Tags */}
          <div className="flex flex-wrap gap-1 items-start content-start relative z-20">
            <span className="text-[10px] text-textMuted/60 self-center mr-1">
              {t('tagsLabel')}
            </span>
            {tags.filter(t => t.category !== 'author' && t.category !== 'gamever').slice(0, 4).map(tag => (
              <Tag
                key={tag.id || tag.displayName}
                color={tag.color || undefined}
                category={tag.category}
                href={`/search?tag=${encodeURIComponent(tag.displayName)}`}
              >
                {tag.displayName}
              </Tag>
            ))}
          </div>

          {/* Divider above Description */}
          <div className="w-full h-px bg-white/5 my-0.5" />

          {/* Description */}
          <div className="text-[11px] text-white leading-relaxed line-clamp-2">
            {description || t('noDescription')}
          </div>

        </div>

        {/* FOOTER */}
        <div className="bg-black/20 px-3 py-2 border-t border-white/5 flex items-center justify-between text-[10px] text-textMuted mt-auto">
          <div className="flex gap-3">
            <span className="flex items-center gap-1.5 text-white font-bold">
              <Star size={12} className="text-yellow-500 fill-yellow-500" />
              {stats.rating.toFixed(1)}
            </span>
            <span className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Download size={12} /> {stats.downloads}
            </span>
            <span className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Eye size={12} /> {stats.views}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Calendar size={12} />
            <DateDisplay date={updatedAt} locale={locale} />
          </div>
        </div>

      </div>

      {/* Main Card Link - Overlay */}
      <Link href={`/mod/${slug}`} className="absolute inset-0 z-10" aria-label={`View ${title}`} />
    </div>
  );
}