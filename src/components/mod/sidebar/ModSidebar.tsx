"use client";

import { Link as LinkIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { ModData, TagData } from "@/types/mod";

import ModSidebarActions from "./ModSidebarActions";
import ModSidebarInstallation from "./ModSidebarInstallation";
import ModSidebarTags from "./ModSidebarTags";
import ModSidebarLocalizations from "./ModSidebarLocalizations";
import ModSidebarSpecs from "./ModSidebarSpecs";
import ModSidebarLinks from "./ModSidebarLinks";

interface ModSidebarProps {
    mod: ModData;
    isEditing: boolean;
    onUpdateField: <K extends keyof ModData>(field: K, value: ModData[K]) => void;
    onUpdate: (data: ModData) => void;
    gameVersionTags: TagData[];
    onGameVersionTagsRefresh?: () => void;
    onGameVersionCreate?: (version: string) => void;
    invalidFields: Set<string>;
    onClearField?: (field: string) => void;
}

/**
 * Основной компонент боковой панели для страницы мода.
 * Объединяет действия, инструкции, теги, локализации и технические характеристики.
 */
export default function ModSidebar({
    mod,
    isEditing,
    onUpdateField,
    onUpdate,
    gameVersionTags,
    onGameVersionTagsRefresh,
    onGameVersionCreate,
    invalidFields,
    onClearField
}: ModSidebarProps) {
    const t = useTranslations('Common');

    return (
        <div className="lg:col-span-4 space-y-6 sticky top-24">
            {/* Блок действий (Скачивание, подписка и т.д.) */}
            <ModSidebarActions
                mod={mod}
                isEditing={isEditing}
                onUpdateField={onUpdateField}
                invalidFields={invalidFields}
                onClearField={onClearField}
            />

            {/* Инструкции по установке */}
            <ModSidebarInstallation
                mod={mod}
                isEditing={isEditing}
                onUpdateField={onUpdateField}
            />

            {/* Теги */}
            <ModSidebarTags
                mod={mod}
                isEditing={isEditing}
                onUpdateField={onUpdateField}
                invalidFields={invalidFields}
                onClearField={onClearField}
            />

            {/* Локализации */}
            <ModSidebarLocalizations
                mod={mod}
                isEditing={isEditing}
                onUpdate={onUpdate}
            />

            {/* Технические характеристики */}
            <ModSidebarSpecs
                mod={mod}
                isEditing={isEditing}
                onUpdateField={onUpdateField}
                gameVersionTags={gameVersionTags}
                onGameVersionTagsRefresh={onGameVersionTagsRefresh}
                onGameVersionCreate={onGameVersionCreate}
                invalidFields={invalidFields}
                onClearField={onClearField}
            />

            {/* Ссылки (Сообщество, Поддержка) */}
            <ModSidebarLinks
                mod={mod}
                isEditing={isEditing}
                onUpdateField={onUpdateField}
            />

            {/* Индикатор режима редактирования */}
            {isEditing && (
                <div className="text-xs text-center text-textMuted italic border border-dashed border-white/10 p-3 rounded-lg bg-white/[0.02]">
                    <LinkIcon size={14} className="inline-block mr-1" />
                    <span>{t('editingInAdminMode')}</span>
                </div>
            )}
        </div>
    );
}
