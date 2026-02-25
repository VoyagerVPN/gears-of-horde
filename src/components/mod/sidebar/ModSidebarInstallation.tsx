"use client";

import { FileCog } from "lucide-react";
import { useTranslations } from "next-intl";
import { ModData } from "@/types/mod";
import SimpleTextEditor from "@/components/ui/SimpleTextEditor";
import InstallationAccordion from "@/components/mod/shared/InstallationAccordion";

interface ModSidebarInstallationProps {
    mod: ModData;
    isEditing: boolean;
    onUpdateField: <K extends keyof ModData>(field: K, value: ModData[K]) => void;
}

/**
 * Блок инструкций по установке мода.
 */
export default function ModSidebarInstallation({
    mod,
    isEditing,
    onUpdateField
}: ModSidebarInstallationProps) {
    const t = useTranslations('Common');

    if (isEditing) {
        return (
            <SimpleTextEditor
                title={t('installationGuide')}
                icon={FileCog}
                items={mod.installationSteps}
                onChange={(newItems) => onUpdateField('installationSteps', newItems)}
                placeholder={t('installationPlaceholder')}
                id="mod-installation-editor"
                name="installationSteps"
                tooltip={t('installationTooltip')}
            />
        );
    }

    return <InstallationAccordion steps={mod.installationSteps} />;
}
