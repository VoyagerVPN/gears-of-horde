"use client";

import SectionHeader from "@/components/ui/SectionHeader";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { Info } from "lucide-react";

interface ModAboutSectionProps {
    description: string;
    isEditing?: boolean;
    onUpdate?: (value: string) => void;
}

import { useTranslations } from 'next-intl';

export default function ModAboutSection({ description, isEditing = false, onUpdate }: ModAboutSectionProps) {
    const t = useTranslations('Common');
    return (
        <section className={`bg-surface rounded-xl p-6 border border-white/5`}>
            <SectionHeader icon={Info}>{t('aboutThisMod')}</SectionHeader>
            {isEditing ? (
                <RichTextEditor
                    id="mod-about-text"
                    name="about"
                    value={description}
                    onChange={(value) => onUpdate?.(value)}
                    placeholder={t('writeDescriptionPlaceholder')}
                    minHeight="150px"
                />
            ) : (
                <div
                    className="text-textMuted leading-relaxed space-y-4 text-sm prose prose-invert prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: description }}
                />
            )}
        </section>
    );
}
