"use client";

import { ElementType } from "react";
import { Users, Coins, ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { ModData, ModLink } from "@/types/mod";
import { SIDEBAR_HEADER_STYLE } from "@/lib/constants/ui-constants";
import { getDomain } from "@/lib/utils";
import LinkUnfurler from "@/components/ui/LinkUnfurler";

interface ModSidebarLinksProps {
    mod: ModData;
    isEditing: boolean;
    onUpdateField: <K extends keyof ModData>(field: K, value: ModData[K]) => void;
}

/**
 * Блок внешних ссылок (Сообщество и Поддержка автора).
 */
export default function ModSidebarLinks({
    mod,
    isEditing,
    onUpdateField
}: ModSidebarLinksProps) {
    const t = useTranslations('Common');

    const updateLinkItem = (category: 'community' | 'donations', index: number, key: 'name' | 'url', value: string) => {
        const newLinks = { ...mod.links };
        newLinks[category] = [...newLinks[category]];
        newLinks[category][index] = { ...newLinks[category][index], [key]: value };
        onUpdateField('links', newLinks);
    };

    const addLinkItem = (category: 'community' | 'donations', initialData?: { name: string, url: string }) => {
        const newLinks = { ...mod.links };
        newLinks[category] = [...newLinks[category], initialData || { name: "", url: "" }];
        onUpdateField('links', newLinks);
    };

    const removeLinkItem = (category: 'community' | 'donations', index: number) => {
        const newLinks = { ...mod.links };
        newLinks[category] = newLinks[category].filter((_, i) => i !== index);
        onUpdateField('links', newLinks);
    };

    const renderLinkBlock = (title: string, icon: ElementType, links: ModLink[], category: 'community' | 'donations') => {
        const Icon = icon;
        if (isEditing) {
            const showGhost = links.length === 0 || links[links.length - 1].url.trim() !== "";
            const displayLinks = showGhost ? [...links, { name: "", url: "" }] : links;
            return (
                <div className="bg-surface rounded-xl p-4 border border-white/5 flex flex-col">
                    <h3 className={SIDEBAR_HEADER_STYLE}>
                        <Users size={16} className="text-primary" /> {title}
                    </h3>
                    <div className="space-y-2 mt-1">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-textMuted font-exo2">{t('links')}</span>
                        </div>
                        {displayLinks.map((link, idx) => {
                            const isReal = idx < links.length;
                            return (
                                <LinkUnfurler
                                    key={idx}
                                    index={idx}
                                    category={category}
                                    name={link.name}
                                    url={link.url}
                                    onNameChange={(value) => {
                                        if (isReal) updateLinkItem(category, idx, 'name', value);
                                        else addLinkItem(category, { name: value, url: link.url });
                                    }}
                                    onUrlChange={(value) => {
                                        if (isReal) updateLinkItem(category, idx, 'url', value);
                                        else addLinkItem(category, { name: link.name, url: value });
                                    }}
                                    onRemove={() => {
                                        if (isReal) removeLinkItem(category, idx);
                                    }}
                                    namePlaceholder={t('name')}
                                    urlPlaceholder={t('url')}
                                />
                            );
                        })}
                        {displayLinks.length === 0 && (
                            <div className="text-xs text-textMuted italic opacity-50 text-center py-2">{t('noLinksAdded')}</div>
                        )}
                    </div>
                </div>
            );
        }

        return (
            <div className="bg-surface rounded-xl p-4 border border-white/5 flex flex-col">
                <h3 className={SIDEBAR_HEADER_STYLE}>
                    <Icon size={16} className="text-primary" /> {title}
                </h3>
                <div className="flex flex-col gap-2 flex-1">
                    {links.map((link, idx) => {
                        const domain = getDomain(link.url);
                        const displayName = link.name?.trim() || domain || 'Link';
                        return (
                            <a
                                key={idx}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-colors group"
                            >
                                {domain && (
                                    <Image
                                        src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
                                        alt={displayName}
                                        width={16}
                                        height={16}
                                        className="rounded-sm opacity-80 group-hover:opacity-100 transition-opacity shrink-0"
                                        unoptimized
                                    />
                                )}
                                <span className="text-xs font-bold text-textMain group-hover:text-white truncate">{displayName}</span>
                                <ExternalLink size={12} className="ml-auto text-textMuted group-hover:text-white opacity-50 group-hover:opacity-100 transition-all shrink-0" />
                            </a>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className={`grid gap-4 ${isEditing ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {renderLinkBlock(t('community'), Users, mod.links.community, 'community')}
            {renderLinkBlock(t('supportCreator'), Coins, mod.links.donations, 'donations')}
        </div>
    );
}
