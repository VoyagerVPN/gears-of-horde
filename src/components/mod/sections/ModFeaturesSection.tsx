"use client";

import { Zap } from "lucide-react";
import { useTranslations } from "next-intl";
import SimpleTextEditor from "@/components/ui/SimpleTextEditor";
import FeatureList from "@/components/mod/shared/FeatureList";

interface ModFeaturesSectionProps {
    features: string[];
    isEditing: boolean;
    onUpdate: (features: string[]) => void;
}

/**
 * Секция особенностей мода (Список фич)
 * Поддерживает режим просмотра и редактирования через SimpleTextEditor
 */
export default function ModFeaturesSection({
    features,
    isEditing,
    onUpdate
}: ModFeaturesSectionProps) {
    const t = useTranslations('Common');

    if (isEditing) {
        return (
            <SimpleTextEditor
                title={t('features')}
                icon={Zap}
                items={features}
                onChange={onUpdate}
                placeholder={t('featuresPlaceholder')}
                id="mod-features-editor"
                name="features"
                tooltip={t('featuresTooltip')}
            />
        );
    }

    return <FeatureList features={features} />;
}
