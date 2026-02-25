"use client";

import { useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import VersionTag from "@/components/VersionTag";

interface AutoSummaryProps {
    modTitle: string;
    version: string;
    originalVersion: string;
    status: string;
    isVersionChanged: boolean;
}

export default function AutoSummary({
    modTitle,
    version,
    originalVersion: _originalVersion,
    status,
    isVersionChanged
}: AutoSummaryProps) {
    const t = useTranslations('UnifiedUpdateModal');
    const locale = useLocale() as "en" | "ru";
    const isRu = locale === "ru";

    const summary = useMemo(() => {
        const parts: React.ReactNode[] = [];

        if (isVersionChanged) {
            parts.push(<VersionTag key="v" type="mod" version={version} />);
            parts.push(isRu ? " выпущена" : " released");
        } else {
            const actionMap: Record<string, string> = {
                'active': t(`statusActionResumed`),
                'on_hold': t(`statusActionPaused`),
                'discontinued': t(`statusActionDiscontinued`),
                'upcoming': t(`statusActionAnnounced`),
                'unknown': t(`statusActionUpdated`)
            };
            const action = actionMap[status] || actionMap['unknown'];
            parts.push(isRu ? "Разработка " : "Development of ");
            parts.push(<strong key="t" className="text-white">{modTitle}</strong>);
            parts.push(` ${action}`);
        }
        return parts;
    }, [isVersionChanged, version, status, modTitle, t, isRu]);

    return (
        <div className="flex items-center gap-1.5 flex-wrap">
            {summary}
        </div>
    );
}
