"use client";

import { Link } from "@/i18n/routing";
import { useTranslations } from 'next-intl';
import { AlertTriangle, ExternalLink } from "lucide-react";
import DateDisplay from "@/components/DateDisplay";
import VersionTag from "@/components/VersionTag";
import Tag from "@/components/ui/Tag";
import { TagData } from "@/types/mod";
import { cn } from "@/lib/utils";
import { getTagColor } from "@/lib/tag-colors";

interface NewsItemProps {
  modName: string;
  modSlug: string;
  description: string;
  date: string;
  tags: TagData[];
  gameVersion?: string;
  isSaveBreaking?: boolean;
  sourceUrl?: string;
  locale?: 'en' | 'ru';
  variant?: 'list' | 'card';
}

export default function NewsItem({
  modName,
  modSlug,
  description,
  date,
  tags,
  gameVersion,
  isSaveBreaking,
  sourceUrl,
  locale = 'en',
  variant = 'list'
}: NewsItemProps) {
  const t = useTranslations('NewsItem');

  // Find the primary tag for the stripe color (prioritize 'newscat' or take first)
  const primaryTag = tags.find(t => t.category === 'newscat') || tags[0];
  // Use getTagColor to get proper fallback colors when DB color is null
  const stripeColor = primaryTag
    ? getTagColor(primaryTag.category || 'tag', primaryTag.value, primaryTag.color)
    : '#a1a1a1';

  // Find gamever tag to get database color
  const gameVerTag = gameVersion ? tags.find(t => t.category === 'gamever' && t.displayName === gameVersion) : null;
  // Use getTagColor for proper color fallback with gamever
  const gameVerColor = gameVerTag
    ? getTagColor('gamever', gameVerTag.value, gameVerTag.color)
    : undefined;

  if (variant === 'card') {
    return (
      <div className="relative flex flex-col w-full bg-surface rounded-lg overflow-hidden hover:bg-surfaceHover transition-colors group border border-white/5 h-full shadow-sm hover:shadow-md hover:border-white/10">
        <Link href={`/mod/${modSlug}`} className="absolute inset-0 z-0" aria-label={`View ${modName}`} />

        {/* Top Stripe */}
        <div
          className="h-1 w-full"
          style={{ background: stripeColor }}
        />

        <div className="flex-1 flex flex-col p-4 relative z-10 pointer-events-none">
          <div className="flex justify-between items-start mb-2 pointer-events-auto">
            <Link
              href={`/mod/${modSlug}`}
              className="font-bold text-base text-textMain group-hover:text-primary transition-colors line-clamp-1"
            >
              {modName}
            </Link>
          </div>

          <DateDisplay
            date={date}
            locale={locale}
            className="text-xs text-textMuted mb-3 font-mono block"
          />

          <p className="text-sm text-textMuted mb-4 leading-relaxed pointer-events-auto line-clamp-4 flex-grow">
            {description}
          </p>

          <div className="flex flex-col gap-3 mt-auto pointer-events-auto">
            <div className="flex flex-wrap gap-1.5">
              {tags.slice(0, 3).map(tag => (
                <Tag
                  key={tag.id || tag.displayName}
                  category={tag.category}
                  value={tag.value}
                  color={tag.color || undefined}
                  href={`/news?tag=${tag.displayName}`}
                >
                  {tag.displayName?.toLowerCase()}
                </Tag>
              ))}
              {tags.length > 3 && (
                <span className="text-[10px] text-textMuted self-center">+{tags.length - 3}</span>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-1">
              <div className="flex gap-1.5 items-center">
                {gameVersion && (
                  <VersionTag type="game" version={gameVersion} color={gameVerColor} />
                )}
                {isSaveBreaking && (
                  <div className="text-amber-500" title={t('saveWipeRequired')}>
                    <AlertTriangle size={14} />
                  </div>
                )}
              </div>

              {sourceUrl && (
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[10px] font-bold text-textMuted hover:text-white transition-colors uppercase tracking-wide bg-white/5 hover:bg-white/10 px-2 py-1 rounded"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink size={10} />
                  Source
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Helper to title case text
  const toTitleCase = (str: string) => str?.toLowerCase();

  return (
    <div className="relative flex w-full bg-surface rounded-lg overflow-hidden hover:bg-surfaceHover transition-colors mb-3 last:mb-0 group border border-white/5 p-3">
      <Link href={`/mod/${modSlug}`} className="absolute inset-0 z-0" aria-label={`View ${modName}`} />

      <div
        className="absolute left-0 top-0 bottom-0 w-1.5"
        style={{ background: stripeColor }}
      />

      <div className="flex-1 flex flex-col pl-3 relative z-10 pointer-events-none">
        <div className="flex justify-between items-start mb-1 pointer-events-auto">
          <Link
            href={`/mod/${modSlug}`}
            className="font-bold text-sm text-textMain group-hover:text-primary transition-colors line-clamp-1"
          >
            {modName}
          </Link>
          <DateDisplay
            date={date}
            locale={locale}
            className="text-[10px] text-textMuted whitespace-nowrap ml-2 font-mono pt-0.5"
          />
        </div>

        <p className="text-xs text-textMuted mb-2.5 leading-relaxed pointer-events-auto">
          {description}
        </p>

        <div className="flex items-center justify-between mt-auto pointer-events-auto">
          <div className="flex flex-wrap gap-1.5">
            {tags.map(tag => (
              <Tag
                key={tag.id || tag.displayName}
                category={tag.category}
                value={tag.value}
                color={tag.color || undefined}
                href={`/news?tag=${tag.displayName}`}
              >
                {toTitleCase(tag.displayName)}
              </Tag>
            ))}

            {gameVersion && (
              <VersionTag type="game" version={gameVersion} color={gameVerColor} />
            )}

            {isSaveBreaking && (
              <Tag variant="warning" className="flex items-center gap-1" title={t('saveWipeRequired')}>
                <AlertTriangle size={10} /> {t('wipe')}
              </Tag>
            )}
          </div>

          {sourceUrl && (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-3 right-3 p-1.5 text-textMuted hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded transition-colors"
              onClick={(e) => e.stopPropagation()}
              title="Source"
            >
              <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}