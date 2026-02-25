"use client";


import { RichTextEditor } from "@/shared/ui";
import { Info } from "lucide-react";

interface ModAboutSectionProps {
    description: string;
    isEditing?: boolean;
    onUpdate?: (value: string) => void;
    invalid?: boolean;
    onClear?: () => void;
}

import { useTranslations } from 'next-intl';

export default function ModAboutSection({
    description,
    isEditing = false,
    onUpdate,
    invalid,
    onClear
}: ModAboutSectionProps) {
    const t = useTranslations('Common');
    return (
        isEditing ? (
            <RichTextEditor
                label={t('aboutThisMod')}
                icon={Info}
                id="mod-about-text"
                name="about"
                value={description}
                onChange={(value) => onUpdate?.(value)}
                placeholder={t('writeDescriptionPlaceholder')}
                minHeight="150px"
                invalid={invalid}
                onClear={onClear}
            />
        ) : (
            <section className={`bg-surface rounded-xl border border-white/5 overflow-hidden`}>
                <div className="w-full flex items-center justify-between p-4 bg-white/[0.02] border-b border-white/5">
                    <div className="flex items-center gap-2">
                        <Info size={20} className="text-primary" />
                        <h2 className="text-lg font-bold text-white font-exo2 uppercase tracking-wide">
                            {t('aboutThisMod')}
                        </h2>
                    </div>
                </div>
                <div className="p-6 bg-black/20">
                    <div
                        className="text-textMuted leading-relaxed space-y-4 text-sm prose prose-invert prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: description }}
                    />
                </div>
            </section>
        )
    );
}
