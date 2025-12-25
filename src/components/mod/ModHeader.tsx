import VersionTag from "@/components/VersionTag";
import { ModData, ModStatusType } from "@/types/mod";
import { Star, Eye, Download } from "lucide-react";
import * as Select from "@radix-ui/react-select";
import { STATUS_CONFIG, STATUS_OPTIONS } from "@/lib/mod-constants";
import { Check } from "lucide-react";
import { TRANSPARENT_INPUT_BASE } from "@/lib/constants/ui-constants";
import Tag from "@/components/ui/Tag";
import AuthorTag from "@/components/AuthorTag";
import TagSelector from "@/components/TagSelector";
import BannerUpload from "@/components/ui/BannerUpload";
import Image from "next/image";

interface ModHeaderProps {
    mod: ModData;
    isEditing?: boolean;
    initialStatus?: ModStatusType;
    onUpdate?: <K extends keyof ModData>(field: K, value: ModData[K]) => void;
    isNew?: boolean;
}

import { useTranslations } from 'next-intl';

export default function ModHeader({ mod, isEditing = false, initialStatus, onUpdate, isNew = false }: ModHeaderProps) {
    const t = useTranslations('Common');
    const statusInfo = STATUS_CONFIG[mod.status] || STATUS_CONFIG.unknown;
    const StatusIcon = statusInfo.icon;

    const updateField = <K extends keyof ModData>(field: K, value: ModData[K]) => {
        if (onUpdate) onUpdate(field, value);
    };

    return (
        <div className="mb-8">
            {/* BANNER */}
            {isEditing ? (
                <div className="mb-6">
                    <BannerUpload
                        currentBannerUrl={mod.bannerUrl || undefined}
                        onBannerChange={(url) => updateField('bannerUrl', url)}
                    />
                </div>
            ) : (
                <div className="w-full aspect-[1000/219] bg-zinc-900 rounded-xl overflow-hidden relative shadow-2xl mb-6">
                    {mod.bannerUrl ? (
                        <Image
                            src={mod.bannerUrl}
                            alt={`${mod.title} banner`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1200px"
                            priority
                        />
                    ) : (
                        <>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                            <div className="absolute inset-0 flex items-center justify-center text-white/10 text-sm font-bold tracking-[0.5em] uppercase pointer-events-none">
                                {t('modBannerImage')}
                            </div>
                        </>
                    )}
                </div>
            )}


            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="flex-1 w-full md:w-auto">
                    {/* Title & Author */}
                    <div className="flex items-center gap-3 mb-2">
                        {isEditing ? (
                            <input
                                id="mod-title-input"
                                name="title"
                                type="text"
                                value={mod.title}
                                onChange={(e) => updateField('title', e.target.value)}
                                className={`text-4xl md:text-5xl font-bold text-white font-exo2 uppercase tracking-wide ${TRANSPARENT_INPUT_BASE}`}
                                placeholder={t('modTitle')}
                            />
                        ) : (
                            <h1 className="text-4xl md:text-5xl font-bold text-white font-exo2 uppercase tracking-wide">
                                {mod.title}
                            </h1>
                        )}
                        {!isEditing && (
                            <VersionTag type="mod" version={mod.version} />
                        )}
                    </div>

                    {isEditing && (
                        <div className="flex items-center gap-2 mb-3 text-xs font-mono text-textMuted">
                            <span className="select-none opacity-50">/mod/</span>
                            <input
                                id="mod-slug-input"
                                name="slug"
                                type="text"
                                value={mod.slug}
                                onChange={(e) => {
                                    // Sanitize slug: only a-z, 0-9, and -
                                    const sanitized = e.target.value
                                        .toLowerCase()
                                        .replace(/[^a-z0-9-]/g, '');
                                    updateField('slug', sanitized);
                                }}
                                className={`bg-transparent border-b border-white/10 outline-none transition-colors min-w-[200px] ${isNew ? 'hover:border-white/30 focus:border-white/50 text-white' : 'text-textMuted cursor-not-allowed border-transparent'}`}
                                placeholder={t('slug')}
                                disabled={!isNew}
                                title={!isNew ? "Slug cannot be changed after creation" : "Auto-generated from title"}
                            />
                        </div>
                    )}

                    <div className={`flex items-center gap-2 text-sm ${isEditing ? '' : 'text-textMuted'}`}>
                        {isEditing ? (
                            <div className="flex flex-col gap-2">
                                <span className="text-textMuted text-xs uppercase tracking-wider font-bold">{t('createdBy')}</span>
                                <div className="flex items-center gap-2 flex-wrap">
                                    {/* Show selected author tags as split pills */}
                                    {mod.tags.filter(t => t.category === 'author').map((authorTag) => (
                                        <Tag
                                            key={authorTag.displayName}
                                            category="author"
                                            showIcon={true}
                                            onRemove={() => {
                                                const newTags = mod.tags.filter(t =>
                                                    !(t.category === 'author' && t.displayName === authorTag.displayName)
                                                );
                                                updateField('tags', newTags);
                                            }}
                                        >
                                            {authorTag.displayName}
                                        </Tag>
                                    ))}
                                    {/* Add input - only show if under max */}
                                    {mod.tags.filter(t => t.category === 'author').length < 5 && (
                                        <TagSelector
                                            selectedTags={mod.tags.filter(t => t.category === 'author')}
                                            onTagsChange={(tags) => {
                                                const nonAuthorTags = mod.tags.filter(t => t.category !== 'author');
                                                const authorTags = tags.map(t => ({
                                                    displayName: t.displayName,
                                                    category: 'author' as const
                                                }));
                                                updateField('tags', [...nonAuthorTags, ...authorTags]);
                                            }}
                                            category="author"
                                            placeholder={mod.tags.filter(t => t.category === 'author').length > 0 ? '+' : t('searchAuthors')}
                                            showPopular={false}
                                            maxTags={5}
                                            hideSelectedTags={true}
                                            className="min-w-[120px] max-w-[180px]"
                                        />
                                    )}
                                </div>
                            </div>
                        ) : (
                            <p className="flex items-center gap-1 flex-wrap">
                                {t('createdBy')}{' '}
                                {mod.tags.filter(t => t.category === 'author').map((authorTag) => (
                                    <AuthorTag key={authorTag.displayName} author={authorTag.displayName} href={`/search?tag=${authorTag.displayName}`} className="hover:opacity-80 transition-opacity cursor-pointer" />
                                ))}
                                {mod.tags.filter(t => t.category === 'author').length === 0 && (
                                    <AuthorTag author={mod.author} href={`/search?tag=${mod.author}`} className="hover:opacity-80 transition-opacity cursor-pointer" />
                                )}
                            </p>
                        )}
                    </div>
                </div>

                {/* STATS BLOCK */}
                <div className="flex items-center bg-surface rounded-lg border border-white/5 divide-x divide-white/10 shadow-sm shrink-0">
                    {/* Status */}
                    <div className="px-5 py-3 text-center min-w-[100px] relative group">
                        <div className={`flex items-center gap-1.5 justify-center ${statusInfo.color} mb-0.5`}>
                            <StatusIcon size={18} />
                            {isEditing ? (
                                <Select.Root value={mod.status} onValueChange={(val) => updateField('status', val as ModStatusType)} name="status">
                                    <Select.Trigger className="absolute inset-0 opacity-0 cursor-pointer z-10 font-bold uppercase">
                                        <Select.Value />
                                    </Select.Trigger>
                                    <Select.Content className="bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl z-[100] overflow-hidden min-w-[140px]">
                                        <Select.Viewport className="p-1">
                                            {STATUS_OPTIONS.map((option) => {
                                                const OptionIcon = option.icon;
                                                const isCurrent = initialStatus === option.value;
                                                return (
                                                    <Select.Item key={option.value} value={option.value} className="flex items-center justify-between gap-2 px-2 py-2 text-[13px] text-textMuted hover:text-white hover:bg-white/10 rounded cursor-pointer outline-none data-[state=checked]:text-white data-[state=checked]:bg-white/5">
                                                        <Select.ItemText asChild>
                                                            <div className="flex items-center gap-2">
                                                                <OptionIcon size={14} className={option.color} />
                                                                {t(`statuses.${option.value}`)}
                                                            </div>
                                                        </Select.ItemText>
                                                        {isCurrent && (
                                                            <span className="text-[11px] bg-white/10 text-white/50 px-2 py-0.5 rounded uppercase tracking-wider font-bold ml-2">
                                                                {t('current')}
                                                            </span>
                                                        )}
                                                        <Select.ItemIndicator>
                                                            <Check size={12} className="text-primary" />
                                                        </Select.ItemIndicator>
                                                    </Select.Item>
                                                );
                                            })}
                                        </Select.Viewport>
                                    </Select.Content>
                                </Select.Root>
                            ) : null}
                            <span className="text-xl font-bold uppercase">{t(`statuses.${mod.status}`)}</span>
                        </div>
                        <div className="text-[10px] text-textMuted uppercase tracking-wider font-exo2">
                            {isEditing ? t('clickToChange') : t('status')}
                        </div>
                    </div>

                    {/* Rating */}
                    <div className="px-5 py-3 text-center min-w-[100px]">
                        <div className="flex items-center gap-1.5 justify-center text-yellow-500 mb-0.5">
                            <Star size={18} fill="currentColor" />
                            <span className="text-xl font-bold text-white">{mod.stats.rating}</span>
                        </div>
                        <div className="text-[10px] text-textMuted uppercase tracking-wider font-exo2" title="Total ratings">
                            {t('rating')}
                        </div>
                    </div>

                    {/* Views */}
                    <div className="px-5 py-3 text-center min-w-[100px]">
                        <div className="flex items-center gap-1.5 justify-center text-textMuted mb-0.5">
                            <Eye size={18} />
                            <span className="text-xl font-bold text-white">{mod.stats.views}</span>
                        </div>
                        <div className="text-[10px] text-textMuted uppercase tracking-wider font-exo2">{t('views')}</div>
                    </div>

                    {/* Downloads */}
                    <div className="px-5 py-3 text-center min-w-[100px]">
                        <div className="flex items-center gap-1.5 justify-center text-primary mb-0.5">
                            <Download size={18} />
                            <span className="text-xl font-bold text-white">{mod.stats.downloads}</span>
                        </div>
                        <div className="text-[10px] text-textMuted uppercase tracking-wider font-exo2">{t('downloads')}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
