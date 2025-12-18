import SectionHeader from "@/components/ui/SectionHeader";
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
        <section className={`bg-surface rounded-xl p-6 border border-white/5 ${isEditing ? 'group focus-within:border-primary/30 transition-colors' : ''}`}>
            <SectionHeader icon={Info}>{t('aboutThisMod')}</SectionHeader>
            {isEditing ? (
                <textarea
                    rows={8}
                    value={description}
                    onChange={(e) => onUpdate?.(e.target.value)}
                    className="w-full bg-transparent text-textMuted leading-relaxed text-sm outline-none resize-y placeholder:text-white/10 focus:text-white transition-colors"
                    placeholder={t('writeDescriptionPlaceholder')}
                />
            ) : (
                <div className="text-textMuted leading-relaxed space-y-4 text-sm">
                    <p>{description}</p>
                </div>
            )}
        </section>
    );
}
