"use client";

import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface ModTitleProps {
    title: string;
    isEditing?: boolean;
    invalid?: boolean;
    onChange?: (value: string) => void;
    onClear?: () => void;
}

export default function ModTitle({ title, isEditing, invalid, onChange, onClear }: ModTitleProps) {
    const t = useTranslations('Common');

    if (!isEditing) {
        return (
            <h1 className="text-4xl md:text-5xl font-bold text-white font-exo2 uppercase tracking-wide truncate">
                {title}
            </h1>
        );
    }

    return (
        <div className="flex items-baseline gap-3 flex-wrap">
            <input
                id="mod-title-input"
                name="title"
                type="text"
                value={title}
                onChange={(e) => {
                    onChange?.(e.target.value);
                    onClear?.();
                }}
                onFocus={() => onClear?.()}
                className={cn(
                    "text-4xl md:text-5xl font-bold text-white font-exo2 uppercase tracking-wide leading-tight",
                    "bg-transparent border-none outline-none px-0 py-1 transition-all max-w-full overflow-hidden text-ellipsis whitespace-nowrap",
                    invalid ? "text-red-400" : ""
                )}
                placeholder={t('modTitle')}
                maxLength={45}
                style={{ width: title ? `${Math.min(title.length + 2, 45)}ch` : '15ch' }}
            />
        </div>
    );
}
