"use client";

import Tag from "@/components/ui/Tag";
import { TagData, ModStatusType } from "@/types/mod";
import { useTranslations } from "next-intl";

interface ModCardStatusProps {
    status: ModStatusType;
    tags: TagData[];
}

export default function ModCardStatus({ status, tags }: ModCardStatusProps) {
    const t = useTranslations('Common');
    const dbStatusTag = tags.find(t => t.category === 'status');

    return (
        <Tag
            category="status"
            value={status}
            color={dbStatusTag?.color || undefined}
            href={`/mods?status=${status}`}
            showIcon={true}
        >
            {t(`statuses.${status}`)}
        </Tag>
    );
}
