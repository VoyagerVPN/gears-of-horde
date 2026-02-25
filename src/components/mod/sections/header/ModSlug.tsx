"use client";

import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface ModSlugProps {
    slug: string;
    invalid?: boolean;
    onChange?: (value: string) => void;
    onClear?: () => void;
}

export default function ModSlug({ slug, invalid, onChange, onClear }: ModSlugProps) {
    const t = useTranslations('Common');

    const handleChange = (value: string) => {
        const sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
        onChange?.(sanitized);
        onClear?.();
    };

    return (
        <div className="flex items-baseline gap-0 mb-3 text-sm font-mono text-textMuted">
            <span className="select-none opacity-50">/mods/</span>
            <input
                id="mod-slug-input"
                name="slug"
                type="text"
                value={slug}
                onChange={(e) => handleChange(e.target.value)}
                onFocus={() => onClear?.()}
                className={cn(
                    "bg-transparent border-none outline-none px-0 py-0 text-sm font-mono placeholder:text-white/20 transition-all leading-none",
                    "text-textMuted hover:text-white/70 focus:text-white/70",
                    invalid ? "text-red-400" : ""
                )}
                placeholder="mod-name"
                maxLength={45}
                title={t("slugEditTooltip")}
                style={{ width: slug ? `${Math.min(Math.max(slug.length, 8), 45)}ch` : '8ch' }}
            />
        </div>
    );
}
