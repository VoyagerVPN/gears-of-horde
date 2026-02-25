"use client";

import { Languages, Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { ModData } from "@/types/mod";
import { SIDEBAR_HEADER_STYLE } from "@/lib/constants/ui-constants";
import Tag from "@/components/ui/Tag";
import EditableLanguageTags from "@/components/mod/shared/EditableLanguageTags";
import SuggestTranslationModal from "@/components/mod/shared/SuggestTranslationModal";

interface ModSidebarLocalizationsProps {
    mod: ModData;
    isEditing: boolean;
    onUpdate: (data: ModData) => void;
}

/**
 * Блок локализаций мода. Показывает поддерживаемые языки и ссылки на внешние переводы.
 */
export default function ModSidebarLocalizations({
    mod,
    isEditing,
    onUpdate
}: ModSidebarLocalizationsProps) {
    const t = useTranslations('Common');

    return (
        <div className="bg-surface rounded-xl p-4 border border-white/5">
            <div className="flex items-center justify-between mb-3">
                <h3 className={SIDEBAR_HEADER_STYLE.replace('mb-3', 'mb-0')}>
                    <Languages size={16} className="text-primary" /> {t('localizations')}
                </h3>
            </div>

            {isEditing ? (
                <EditableLanguageTags
                    items={mod.tags.filter(t => t.category === 'lang')}
                    onChange={(newLangTags) => {
                        const otherTags = mod.tags.filter(t => t.category !== 'lang');
                        onUpdate({ ...mod, tags: [...otherTags, ...newLangTags] });
                    }}
                />
            ) : (
                <>
                    <div className="flex flex-wrap gap-2 mb-3">
                        {mod.tags
                            .filter(t => t.category === 'lang')
                            .map((loc, idx) => {
                                const displayName = loc.displayName || 'Unknown';
                                const hasExternalLink = loc.externalLink && loc.externalLink.trim().length > 0;
                                return !hasExternalLink ? (
                                    <Tag key={idx} category="lang" value="builtin">
                                        {displayName}
                                    </Tag>
                                ) : (
                                    <Tag
                                        key={idx}
                                        category="lang"
                                        value="external"
                                        href={`/mods?lang=${encodeURIComponent(loc.value || '')}`}
                                        onAction={() => window.open(loc.externalLink!, '_blank')}
                                        actionIcon={<Download size={14} />}
                                    >
                                        {displayName}
                                    </Tag>
                                );
                            })}
                    </div>
                    <SuggestTranslationModal modSlug={mod.slug} modName={mod.title} />
                </>
            )}
        </div>
    );
}
