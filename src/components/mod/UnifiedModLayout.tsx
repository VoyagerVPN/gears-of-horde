"use client";

import { ChevronLeft } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useTranslations, useLocale } from 'next-intl';

import { ModData, ModStatusType, TagData } from "@/types/mod";
import FeedbackSection from "@/components/mod/sections/FeedbackSection";

// Extracted components
import ModHeader from "@/components/mod/sections/ModHeader";
import ModAboutSection from "@/components/mod/sections/ModAboutSection";
import ModFeaturesSection from "@/components/mod/sections/ModFeaturesSection";
import ModMediaSection from "@/components/mod/sections/ModMediaSection";
import ModChangelogSection from "@/components/mod/sections/ModChangelogSection";
import ModSidebar from "@/components/mod/sidebar/ModSidebar";

interface UnifiedModLayoutProps {
    mod: ModData;
    isEditing?: boolean;
    onUpdate?: (data: ModData) => void;
    initialStatus?: ModStatusType;
    isNew?: boolean;
    gameVersionTags?: TagData[];
    onGameVersionTagsRefresh?: () => void;
    onGameVersionCreate?: (version: string) => void;
    invalidFields?: Set<string>;
    onClearField?: (field: string) => void;
}

/**
 * Основной макет страницы мода. 
 * Реализует паттерн композиции, делегируя рендеринг секций специализированным компонентам.
 */
export default function UnifiedModLayout({
    mod,
    isEditing = false,
    onUpdate,
    initialStatus,
    isNew = false,
    gameVersionTags = [],
    onGameVersionTagsRefresh,
    onGameVersionCreate,
    invalidFields = new Set(),
    onClearField
}: UnifiedModLayoutProps) {
    const t = useTranslations('Common');
    const locale = useLocale() as 'en' | 'ru';

    // --- ОБРАБОТЧИКИ (Проксируют изменения в родительский компонент) ---
    const updateField = <K extends keyof ModData>(field: K, value: ModData[K]) => {
        if (onUpdate) onUpdate({ ...mod, [field]: value });
    };

    const updateVideo = (type: 'trailer' | 'review', value: string) => {
        if (onUpdate) onUpdate({ ...mod, videos: { ...mod.videos, [type]: value } });
    };

    return (
        <div className="max-w-[1600px] mx-auto px-4 py-8">

            {/* Ссылка назад (только в режиме просмотра) */}
            {!isEditing && !onUpdate && (
                <Link href="/" className="inline-flex items-center gap-2 text-textMuted hover:text-white transition-colors mb-6 text-xs uppercase tracking-widest font-bold font-exo2">
                    <ChevronLeft size={16} /> {t('backToCatalog')}
                </Link>
            )}

            {/* === ШАПКА === */}
            <ModHeader
                mod={mod}
                isEditing={isEditing}
                initialStatus={initialStatus}
                onUpdate={updateField}
                isNew={isNew}
                invalidFields={invalidFields}
                onClearField={onClearField}
                hideAdminEdit={!!onUpdate}
            />

            {/* === ОСНОВНОЙ КОНТЕНТ === */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* ЛЕВАЯ КОЛОНКА */}
                <div className="lg:col-span-8 space-y-8">

                    {/* Описание */}
                    <ModAboutSection
                        description={mod.description}
                        isEditing={isEditing}
                        onUpdate={(value) => updateField('description', value)}
                        invalid={invalidFields.has('description')}
                        onClear={() => onClearField?.('description')}
                    />

                    {/* Особенности */}
                    <ModFeaturesSection
                        features={mod.features}
                        isEditing={isEditing}
                        onUpdate={(features) => updateField('features', features)}
                    />

                    {/* Медиа (Видео и скриншоты) */}
                    <ModMediaSection
                        screenshots={mod.screenshots}
                        videos={mod.videos}
                        isEditing={isEditing}
                        onUpdateScreenshots={(urls) => updateField('screenshots', urls)}
                        onUpdateVideo={updateVideo}
                        invalidFields={invalidFields}
                        onClearField={onClearField}
                    />

                    {/* Список изменений */}
                    <ModChangelogSection
                        changelog={mod.changelog}
                        isEditing={isEditing}
                        onUpdate={(logs) => updateField('changelog', logs)}
                    />

                    {/* Обратная связь и отзывы */}
                    {isEditing ? (
                        <div className="p-6 border border-dashed border-white/10 rounded-xl text-center text-textMuted text-sm bg-white/[0.02]">
                            {t('feedbackReadOnly')}
                        </div>
                    ) : (
                        <FeedbackSection locale={locale} />
                    )}

                </div>

                {/* ПРАВАЯ КОЛОНКА (Боковая панель) */}
                <ModSidebar
                    mod={mod}
                    isEditing={isEditing}
                    onUpdateField={updateField}
                    onUpdate={(data) => onUpdate?.(data)}
                    gameVersionTags={gameVersionTags}
                    onGameVersionTagsRefresh={onGameVersionTagsRefresh}
                    onGameVersionCreate={onGameVersionCreate}
                    invalidFields={invalidFields}
                    onClearField={onClearField}
                />
                
            </div>
        </div>
    );
}
