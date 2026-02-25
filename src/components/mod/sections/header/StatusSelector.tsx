"use client";

import * as Select from "@radix-ui/react-select";
import { Check } from "lucide-react";
import { ModStatusType } from "@/types/mod";
import { STATUS_OPTIONS, STATUS_CONFIG } from "@/lib/mod-constants";
import { useTranslations } from "next-intl";

interface StatusSelectorProps {
    status: ModStatusType;
    initialStatus?: ModStatusType;
    onChange?: (status: ModStatusType) => void;
}

export default function StatusSelector({ status, initialStatus, onChange }: StatusSelectorProps) {
    const t = useTranslations('Common');
    const statusInfo = STATUS_CONFIG[status] || STATUS_CONFIG.unknown;
    const StatusIcon = statusInfo.icon;

    return (
        <div className="px-5 py-3 text-center min-w-[100px] relative group">
            <div className={`flex items-center gap-1.5 justify-center ${statusInfo.color} mb-0.5`}>
                <StatusIcon size={18} />
                {onChange && (
                    <Select.Root value={status} onValueChange={(val) => onChange(val as ModStatusType)}>
                        <Select.Trigger className="absolute inset-0 opacity-0 cursor-pointer z-10 font-bold uppercase">
                            <Select.Value />
                        </Select.Trigger>
                        <Select.Content className="bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl z-[100] overflow-hidden min-w-[140px]">
                            <Select.Viewport className="p-1">
                                {STATUS_OPTIONS.map((option) => {
                                    const OptionIcon = option.icon;
                                    const isCurrent = initialStatus === option.value;
                                    return (
                                        <Select.Item
                                            key={option.value}
                                            value={option.value}
                                            className="flex items-center justify-between gap-2 px-2 py-2 text-[13px] text-textMuted hover:text-white hover:bg-white/10 rounded cursor-pointer outline-none data-[state=checked]:text-white data-[state=checked]:bg-white/5"
                                        >
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
                )}
                <span className="text-xl font-bold uppercase">{t(`statuses.${status}`)}</span>
            </div>
            <div className="text-[10px] text-textMuted uppercase tracking-wider font-exo2">
                {onChange ? t('clickToChange') : t('status')}
            </div>
        </div>
    );
}
