"use client";

import { Link } from "@/i18n/routing";
import { useTranslations } from 'next-intl';
import { AlertTriangle, ExternalLink, Pencil } from "lucide-react";
import DateDisplay from "@/components/DateDisplay";
import Tag from "@/components/ui/Tag";
import { FrozenTag } from "@/schemas/news.schema";
import { cn } from "@/lib/utils";
import { getTagColor } from "@/lib/tag-colors";
import VersionTag from "@/components/VersionTag";

interface NewsCardProps {
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
  /** Admin edit callback */
  onEdit?: () => void;
}

export default function NewsCard({
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
  onEdit
}: NewsCardProps) {
  const t = useTranslations('NewsCard');

  // Find the primary tag for the stripe color (prioritize 'newscat' or take first)
  const primaryTag = tags.find(t => t.category === 'newscat') || tags[0];
  const stripeColor = primaryTag
    ? getTagColor(primaryTag.category || 'tag', primaryTag.displayName, primaryTag.color)
    : '#a1a1a1';

  // Get game version color - Prioritize the tag in the array as source of truth
  const gameVerTag = tags.find(t => t.category === 'gamever');
  const gameVerColor = gameVerTag?.color || (gameVersion
    ? getTagColor('gamever', gameVersion, undefined)
    : undefined);

  // Filter out gamever tags from display (we show it separately with gamepad icon)
  const displayTags = tags.filter(t => t.category !== 'gamever');

  // Display text: use description if provided, otherwise fall back to content
  const displayText = description || content;

  return (
    <div className="relative flex flex-row w-full bg-surface rounded-lg overflow-hidden hover:bg-surfaceHover transition-colors group border border-white/5 min-h-[80px]">
      <Link href={modSlug ? `/mods/${modSlug}` : '#'} className="absolute inset-0 z-0" aria-label={`View ${modName}`} />

      {/* Wipe Ribbon - Top Left */}
      {wipeRequired && (
        <div className="absolute top-0 left-0 z-20 bg-red-500/90 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 flex items-center gap-1 rounded-br">
          <AlertTriangle size={11} />
          {t('wipe')}
        </div>
      )}

      {/* Admin Edit Button - Top Right */}
      {onEdit && (
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(); }}
          className="absolute top-2 right-2 z-20 p-1.5 bg-black/50 hover:bg-primary/80 text-white/70 hover:text-white rounded transition-colors opacity-0 group-hover:opacity-100"
          title="Edit"
        >
          <Pencil size={14} />
        </button>
      )}

      {/* Left Stripe */}
      <div
        className="w-1.5 flex-shrink-0"
        style={{ background: stripeColor }}
      />

      <div className={cn(
        "flex-1 flex flex-col p-3 relative z-10 pointer-events-none",
        wipeRequired && "pt-6"
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
            <VersionTag type="mod" version={modVersion} />
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
                value={tag.displayName?.toLowerCase()}
                color={tag.color || undefined}
                href={`/news?tag=${tag.displayName}`}
                showIcon={true}
              >
                {tag.displayName}
              </Tag>
            ))}

            {gameVersion && (
              <VersionTag type="game" version={gameVersion} color={gameVerColor} />
            )}
          </div>

          {sourceUrl && (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-textMuted hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded transition-colors ml-auto"
              onClick={(e) => e.stopPropagation()}
              title={t('source')}
            >
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

