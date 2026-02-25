"use client";

import { Pencil } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useSupabaseAuth } from "@/components/SupabaseAuthProvider";

import { ModData, ModStatusType } from "@/types/mod";
import BannerUpload from "@/components/ui/BannerUpload";
import AuthorTag from "@/components/AuthorTag";

import ModTitle from "./header/ModTitle";
import ModSlug from "./header/ModSlug";
import ModStats from "./header/ModStats";
import AuthorEditor from "./header/AuthorEditor";

interface ModHeaderProps {
    mod: ModData;
    isEditing?: boolean;
    initialStatus?: ModStatusType;
    onUpdate?: <K extends keyof ModData>(field: K, value: ModData[K]) => void;
    isNew?: boolean;
    invalidFields?: Set<string>;
    onClearField?: (field: string) => void;
    hideAdminEdit?: boolean;
}

export default function ModHeader({
    mod,
    isEditing = false,
    initialStatus,
    onUpdate,
    isNew: _isNew = false,
    invalidFields = new Set(),
    onClearField,
    hideAdminEdit = false
}: ModHeaderProps) {
    const t = useTranslations('Common');
    const { role } = useSupabaseAuth();

    const updateField = <K extends keyof ModData>(field: K, value: ModData[K]) => {
        onUpdate?.(field, value);
    };

    return (
        <div className="mb-8">
            {/* Banner */}
            {isEditing ? (
                <div className="mb-6">
                    <BannerUpload
                        currentBannerUrl={mod.bannerUrl || undefined}
                        onBannerChange={(url) => {
                            updateField('bannerUrl', url);
                            onClearField?.('bannerUrl');
                        }}
                        invalid={invalidFields.has('bannerUrl')}
                    />
                </div>
            ) : (
                <div className="w-full aspect-[1000/219] bg-zinc-900 rounded-xl overflow-hidden relative shadow-2xl mb-6">
                    {mod.bannerUrl ? (
                        <img
                            src={mod.bannerUrl}
                            alt={`${mod.title} banner`}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            <div className="absolute inset-0 flex items-center justify-center text-white/10 text-sm font-bold tracking-[0.5em] uppercase pointer-events-none">
                                {t('modBannerImage')}
                            </div>
                        </>
                    )}
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 w-full">
                <div className="flex-1 min-w-0 w-full">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <ModTitle
                            title={mod.title}
                            isEditing={isEditing}
                            invalid={invalidFields.has('title')}
                            onChange={(value) => updateField('title', value)}
                            onClear={() => onClearField?.('title')}
                        />
                    </div>

                    {isEditing && (
                        <ModSlug
                            slug={mod.slug}
                            invalid={invalidFields.has('slug')}
                            onChange={(value) => updateField('slug', value)}
                            onClear={() => onClearField?.('slug')}
                        />
                    )}

                    <div className={`flex items-center gap-2 text-sm ${isEditing ? '' : 'text-textMuted'}`}>
                        {isEditing ? (
                            <AuthorEditor
                                mod={mod}
                                invalid={invalidFields.has('author')}
                                onUpdate={updateField}
                                onClear={() => onClearField?.('author')}
                            />
                        ) : (
                            <p className="flex items-center gap-1 flex-wrap">
                                {t('createdBy')}{' '}
                                {mod.tags.filter(t => t.category === 'author').map((authorTag) => (
                                    <AuthorTag
                                        key={authorTag.displayName}
                                        author={authorTag.displayName}
                                        href={`/mods?author=${encodeURIComponent(authorTag.displayName)}`}
                                        className="hover:opacity-80 transition-opacity cursor-pointer"
                                    />
                                ))}
                                {mod.tags.filter(t => t.category === 'author').length === 0 && (
                                    <AuthorTag
                                        author={mod.author}
                                        href={`/mods?author=${encodeURIComponent(mod.author)}`}
                                        className="hover:opacity-80 transition-opacity cursor-pointer"
                                    />
                                )}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    {!isEditing && !hideAdminEdit && role === 'ADMIN' && mod.slug && (
                        <Link
                            href={`/editor/${mod.slug}`}
                            className="flex items-center justify-center w-12 h-12 rounded-lg bg-surface border border-white/5 text-textMuted hover:text-white hover:bg-white/10 transition-all"
                            title={t('edit')}
                        >
                            <Pencil size={20} />
                        </Link>
                    )}

                    <ModStats
                        rating={mod.stats.rating}
                        views={mod.stats.views}
                        downloads={mod.stats.downloads}
                        status={mod.status}
                        initialStatus={initialStatus}
                        isEditing={isEditing}
                        onStatusChange={isEditing ? (status) => updateField('status', status) : undefined}
                    />
                </div>
            </div>
        </div>
    );
}
