"use client";

import { Link } from "@/i18n/routing";
import { useTranslations } from 'next-intl';
import { AlertTriangle, ExternalLink, Settings, Gamepad2 } from "lucide-react";
import DateDisplay from "@/components/DateDisplay";
import Tag from "@/components/ui/Tag";
import { FrozenTag } from "@/schemas/news.schema";
import { cn } from "@/lib/utils";
import { getTagColor } from "@/lib/tag-colors";

interface NewsItemProps {
  modName: string;
  modSlug?: string;
  modVersion?: string;
  gameVersion?: string;
  actionText?: string;
  description?: string;
  content?: string;
  date: string;
  tags: FrozenTag[];
  wipeRequired?: boolean;
  sourceUrl?: string;
  locale?: 'en' | 'ru';
  variant?: 'list' | 'card';
}

export default function NewsItem({
  modName,
  modSlug,
  modVersion,
  gameVersion,
  actionText = 'released',
  description,
  content,
  date,
  tags,
  wipeRequired,
  sourceUrl,
  locale = 'en',
  variant = 'list'
}: NewsItemProps) {
  const t = useTranslations('NewsItem');

  // Find the primary tag for the stripe color (prioritize 'newscat' or take first)
  const primaryTag = tags.find(t => t.category === 'newscat') || tags[0];
  const stripeColor = primaryTag
    ? getTagColor(primaryTag.category || 'tag', primaryTag.displayName, primaryTag.color)
    : '#a1a1a1';

  // Get game version color
  const gameVerColor = gameVersion
    ? getTagColor('gamever', gameVersion, undefined)
    : undefined;

  // Filter out gamever tags from display (we show it separately with gamepad icon)
  const displayTags = tags.filter(t => t.category !== 'gamever');

  // Display text: use description if provided, otherwise fall back to content
  const displayText = description || content;

  if (variant === 'card') {
    return (
      <div className="relative flex flex-col w-full bg-surface rounded-lg overflow-hidden hover:bg-surfaceHover transition-colors group border border-white/5 h-full shadow-sm hover:shadow-md hover:border-white/10">
        <Link href={modSlug ? `/mods/${modSlug}` : '#'} className="absolute inset-0 z-0" aria-label={`View ${modName}`} />

        {/* Wipe Ribbon - Top Left */}
        {wipeRequired && (
          <div className="absolute top-0 left-0 z-20 bg-amber-500/90 text-black text-[10px] font-bold uppercase tracking-wider px-2 py-1 flex items-center gap-1 rounded-br">
            <AlertTriangle size={10} />
            {t('wipe')}
          </div>
        )}

        {/* Top Stripe */}
        <div
          className="h-1 w-full"
          style={{ background: stripeColor }}
        />

        <div className="flex-1 flex flex-col p-4 relative z-10 pointer-events-none">
          {/* Row 1: Mod Name */}
          <div className="pointer-events-auto mb-2">
            <Link
              href={modSlug ? `/mods/${modSlug}` : '#'}
              className="font-bold text-base text-textMain group-hover:text-primary transition-colors line-clamp-1"
            >
              {modName}
            </Link>
          </div>

          {/* Row 2: Version Pill + Action + Date */}
          <div className="flex items-center gap-2 mb-3 pointer-events-auto flex-wrap">
            {modVersion && (
              <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-white/10 text-white/80 rounded text-xs font-mono font-bold">
                <Settings size={12} className="text-zinc-400" />
                {modVersion}
              </span>
            )}
            <span className="text-sm text-textMuted">{actionText}</span>
            <DateDisplay
              date={date}
              locale={locale}
              className="text-xs text-textMuted font-mono"
            />
          </div>

          {/* Row 3: Description (optional) */}
          {displayText && (
            <p className="text-sm text-textMuted mb-4 leading-relaxed pointer-events-auto line-clamp-3">
              {displayText}
            </p>
          )}

          {/* Row 4: Tags + Game Version + Source */}
          <div className="flex items-center justify-between mt-auto pointer-events-auto">
            <div className="flex flex-wrap gap-1.5 items-center">
              {displayTags.slice(0, 3).map((tag, idx) => (
                <Tag
                  key={tag.displayName + idx}
                  category={tag.category}
                  color={tag.color || undefined}
                  href={`/news?tag=${tag.displayName}`}
                >
                  {tag.displayName?.toLowerCase()}
                </Tag>
              ))}
              {displayTags.length > 3 && (
                <span className="text-[10px] text-textMuted">+{displayTags.length - 3}</span>
              )}

              {gameVersion && (
                <Tag
                  category="gamever"
                  color={gameVerColor}
                  className="font-mono font-bold gap-1.5"
                >
                  <Gamepad2 size={12} />
                  {gameVersion}
                </Tag>
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
                {t('source')}
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ========== LIST VARIANT ==========
  return (
    <div className="relative flex w-full bg-surface rounded-lg overflow-hidden hover:bg-surfaceHover transition-colors mb-3 last:mb-0 group border border-white/5 p-3">
      <Link href={modSlug ? `/mods/${modSlug}` : '#'} className="absolute inset-0 z-0" aria-label={`View ${modName}`} />

      {/* Wipe Ribbon - Top Left */}
      {wipeRequired && (
        <div className="absolute top-0 left-0 z-20 bg-amber-500/90 text-black text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 flex items-center gap-1 rounded-br">
          <AlertTriangle size={10} />
          {t('wipe')}
        </div>
      )}

      {/* Left Stripe */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1.5"
        style={{ background: stripeColor }}
      />

      <div className={cn(
        "flex-1 flex flex-col pl-3 relative z-10 pointer-events-none",
        wipeRequired && "pt-4" // Add padding when wipe ribbon is shown
      )}>
        {/* Row 1: Mod Name */}
        <div className="pointer-events-auto mb-1">
          <Link
            href={modSlug ? `/mods/${modSlug}` : '#'}
            className="font-bold text-sm text-textMain group-hover:text-primary transition-colors line-clamp-1"
          >
            {modName}
          </Link>
        </div>

        {/* Row 2: Version Pill + Action + Date */}
        <div className="flex items-center gap-2 mb-2 pointer-events-auto flex-wrap">
          {modVersion && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-white/10 text-white/80 rounded text-[11px] font-mono font-bold">
              <Settings size={10} className="text-zinc-400" />
              {modVersion}
            </span>
          )}
          <span className="text-xs text-textMuted">{actionText}</span>
          <DateDisplay
            date={date}
            locale={locale}
            className="text-[10px] text-textMuted font-mono"
          />
        </div>

        {/* Row 3: Description (optional) */}
        {displayText && (
          <p className="text-xs text-textMuted mb-2.5 leading-relaxed pointer-events-auto line-clamp-2">
            {displayText}
          </p>
        )}

        {/* Row 4: Tags + Game Version */}
        <div className="flex items-center justify-between mt-auto pointer-events-auto">
          <div className="flex flex-wrap gap-1.5 items-center">
            {displayTags.map((tag, idx) => (
              <Tag
                key={tag.displayName + idx}
                category={tag.category}
                color={tag.color || undefined}
                href={`/news?tag=${tag.displayName}`}
              >
                {tag.displayName?.toLowerCase()}
              </Tag>
            ))}

            {gameVersion && (
              <Tag
                category="gamever"
                color={gameVerColor}
                className="font-mono font-bold gap-1.5"
              >
                <Gamepad2 size={12} />
                {gameVersion}
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
              title={t('source')}
            >
              <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}