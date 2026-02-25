"use client";

import { Link as LinkIcon } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { ModData, TagData } from "@/types/mod";
import { SIDEBAR_HEADER_STYLE, STANDARD_INPUT_STYLE } from "@/lib/constants/ui-constants";
import { cn } from "@/lib/utils";
import VersionTag from "@/components/VersionTag";
import GameVersionSelector from "@/components/ui/GameVersionSelector";
import { DatePicker } from "@/shared/ui";
import DateDisplay from "@/components/DateDisplay";

interface ModSidebarSpecsProps {
    mod: ModData;
    isEditing: boolean;
    onUpdateField: <K extends keyof ModData>(field: K, value: ModData[K]) => void;
    gameVersionTags: TagData[];
    onGameVersionTagsRefresh?: () => void;
    onGameVersionCreate?: (version: string) => void;
    invalidFields: Set<string>;
    onClearField?: (field: string) => void;
}

/**
 * Блок технических характеристик (Версия мода, Версия игры, Даты).
 */
export default function ModSidebarSpecs({
    mod,
    isEditing,
    onUpdateField,
    gameVersionTags,
    onGameVersionTagsRefresh,
    onGameVersionCreate,
    invalidFields,
    onClearField
}: ModSidebarSpecsProps) {
    const t = useTranslations('Common');
    const locale = useLocale() as 'en' | 'ru';
    
    // Тег версии игры для цвета
    const gameVerTag = mod.tags.find(t => t.category === 'gamever');

    return (
        <div className="bg-surface rounded-xl p-4 border border-white/5">
            <h3 className={SIDEBAR_HEADER_STYLE}>
                <LinkIcon size={16} className="text-primary" /> {t('technicalSpecs')}
            </h3>
            <div className="space-y-3 text-sm">
                {/* Версия мода */}
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-textMuted uppercase tracking-wider font-bold font-exo2">{t('modVersion')}:</span>
                    {isEditing ? (
                        <input 
                            type="text" 
                            value={mod.version} 
                            onChange={e => onUpdateField('version', e.target.value)} 
                            className={cn(STANDARD_INPUT_STYLE, "w-24 text-right py-1")} 
                            spellCheck={false} 
                            placeholder="1.0.0.0" 
                        />
                    ) : (
                        <VersionTag type="mod" version={mod.version} />
                    )}
                </div>

                {/* Версия игры */}
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-textMuted uppercase tracking-wider font-bold font-exo2">{t('gameVersion')}:</span>
                    {isEditing ? (
                        <GameVersionSelector
                            value={mod.gameVersion}
                            onChange={(value) => onUpdateField('gameVersion', value)}
                            gameVersionTags={gameVersionTags}
                            onTagsRefresh={onGameVersionTagsRefresh}
                            onCreateVersion={onGameVersionCreate}
                            compact
                            invalid={invalidFields.has('gameVersion')}
                            onClear={() => onClearField?.('gameVersion')}
                        />
                    ) : (
                        <VersionTag type="game" version={mod.gameVersion} color={gameVerTag?.color || undefined} />
                    )}
                </div>

                {/* Обновлено */}
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-textMuted uppercase tracking-wider font-bold font-exo2">{t('updated')}:</span>
                    {isEditing ? (
                        <DatePicker
                            value={mod.changelog[0]?.date ? new Date(mod.changelog[0].date) : undefined}
                            onChange={(date) => {
                                const newLogs = [...mod.changelog];
                                if (newLogs.length > 0) {
                                    newLogs[0] = { ...newLogs[0], date: date ? date.toISOString() : "" };
                                    onUpdateField('changelog', newLogs);
                                }
                            }}
                            className="text-xs py-0.5"
                            locale={locale}
                        />
                    ) : (
                        <DateDisplay date={mod.changelog[0]?.date || new Date().toISOString()} locale={locale} className="font-mono text-textMain font-bold text-[13px]" />
                    )}
                </div>

                {/* Создано */}
                <div className="flex items-center justify-between">
                    <span className="text-textMuted uppercase tracking-wider font-bold font-exo2">{t('created')}:</span>
                    {isEditing ? (
                        <DatePicker
                            value={mod.createdAt ? new Date(mod.createdAt) : undefined}
                            onChange={(date) => onUpdateField('createdAt', date ? date.toISOString() : undefined)}
                            className="text-xs py-0.5"
                            locale={locale}
                        />
                    ) : (
                        mod.createdAt && <DateDisplay date={mod.createdAt} locale={locale} className="font-mono text-textMain font-bold text-[13px]" />
                    )}
                </div>
            </div>
        </div>
    );
}
