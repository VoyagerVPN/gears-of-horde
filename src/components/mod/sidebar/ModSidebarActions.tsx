"use client";

import { Download, Link as LinkIcon, MessageSquare, AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import { ModData } from "@/types/mod";
import { SIDEBAR_HEADER_STYLE, STANDARD_INPUT_STYLE, INVALID_INPUT_STYLE } from "@/lib/constants/ui-constants";
import { cn } from "@/lib/utils";
import ViewModeActions from "@/components/mod/shared/ViewModeActions";

interface ModSidebarActionsProps {
    mod: ModData;
    isEditing: boolean;
    onUpdateField: <K extends keyof ModData>(field: K, value: ModData[K]) => void;
    invalidFields: Set<string>;
    onClearField?: (field: string) => void;
}

/**
 * Блок действий в боковой панели.
 * В режиме редактирования: поля ввода для ссылок и флаг "wipe".
 * В режиме просмотра: кнопки скачивания, дискорда и подписки.
 */
export default function ModSidebarActions({
    mod,
    isEditing,
    onUpdateField,
    invalidFields,
    onClearField
}: ModSidebarActionsProps) {
    const t = useTranslations('Common');

    if (!isEditing) {
        return (
            <div className="bg-surface rounded-xl p-4 border border-white/5 relative overflow-hidden">
                <ViewModeActions mod={mod} t={t} />
            </div>
        );
    }

    return (
        <div className="bg-surface rounded-xl p-4 border border-white/5 relative overflow-hidden space-y-4">
            <div className="flex items-center justify-between mb-2">
                <h3 className={cn(SIDEBAR_HEADER_STYLE, "mb-0")}>
                    <LinkIcon size={16} className="text-primary" /> {t('actions')}
                </h3>
                <button
                    onClick={() => onUpdateField('isSaveBreaking', !mod.isSaveBreaking)}
                    className={cn(
                        "inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all",
                        mod.isSaveBreaking 
                            ? "bg-red-500/20 text-red-400 border-red-500/50 hover:bg-red-500/30" 
                            : "bg-transparent text-textMuted border-white/10 hover:text-white hover:border-white/30"
                    )}
                >
                    <AlertTriangle size={12} />
                    {t('wipe')}
                </button>
            </div>
            <div className="space-y-3">
                <div className="space-y-1">
                    <label htmlFor="mod-sidebar-download-url" className="text-xs font-bold text-textMuted uppercase font-exo2">{t('downloadUrl')}</label>
                    <div className="relative">
                        <input
                            id="mod-sidebar-download-url"
                            type="text"
                            value={mod.links.download}
                            onChange={e => {
                                onUpdateField('links', { ...mod.links, download: e.target.value });
                                onClearField?.('links.download');
                            }}
                            onFocus={() => onClearField?.('links.download')}
                            className={cn(
                                STANDARD_INPUT_STYLE,
                                "pl-8",
                                invalidFields.has('links.download') ? INVALID_INPUT_STYLE : ""
                            )}
                            placeholder="https://nexusmods.com/..."
                        />
                        <Download size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-textMuted opacity-50" />
                    </div>
                </div>
                <div className="space-y-1">
                    <label htmlFor="mod-sidebar-discord-url" className="text-xs font-bold text-textMuted uppercase font-exo2">{t('discordUrl')}</label>
                    <div className="relative">
                        <input
                            id="mod-sidebar-discord-url"
                            type="text"
                            value={mod.links.discord}
                            onChange={e => onUpdateField('links', { ...mod.links, discord: e.target.value })}
                            className={cn(STANDARD_INPUT_STYLE, "pl-8")}
                            placeholder="https://discord.gg/..."
                        />
                        <MessageSquare size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-textMuted opacity-50" />
                    </div>
                </div>
            </div>
        </div>
    );
}
