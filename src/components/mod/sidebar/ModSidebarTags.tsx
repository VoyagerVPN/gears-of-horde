"use client";

import { Tags } from "lucide-react";
import { useTranslations } from "next-intl";
import { ModData } from "@/types/mod";
import { SIDEBAR_HEADER_STYLE } from "@/lib/constants/ui-constants";
import Tag from "@/components/ui/Tag";
import TagSelector from "@/components/TagSelector";

interface ModSidebarTagsProps {
    mod: ModData;
    isEditing: boolean;
    onUpdateField: <K extends keyof ModData>(field: K, value: ModData[K]) => void;
    invalidFields: Set<string>;
    onClearField?: (field: string) => void;
}

/**
 * Блок тегов мода в боковой панели.
 */
export default function ModSidebarTags({
    mod,
    isEditing,
    onUpdateField,
    invalidFields,
    onClearField
}: ModSidebarTagsProps) {
    const t = useTranslations('Common');

    return (
        <div className="bg-surface rounded-xl p-4 border border-white/5">
            <h3 className={SIDEBAR_HEADER_STYLE}>
                <Tags size={16} className="text-primary" /> {t('tags')}
            </h3>
            {isEditing ? (
                <TagSelector
                    selectedTags={mod.tags.filter(t => t.category === 'tag')}
                    onTagsChange={(newTags) => {
                        const otherTags = mod.tags.filter(t => t.category !== 'tag');
                        onUpdateField('tags', [...otherTags, ...newTags]);
                    }}
                    category="tag"
                    showPopular={true}
                    invalid={invalidFields.has('tags')}
                    onClear={() => onClearField?.('tags')}
                />
            ) : (
                <div className="flex flex-wrap gap-2">
                    {mod.tags
                        .filter(t => t.category === 'tag')
                        .sort((a, b) => a.displayName.localeCompare(b.displayName))
                        .map(tag => (
                            <Tag
                                key={tag.id || tag.displayName}
                                color={tag.color || undefined}
                                href={`/mods?tags=${encodeURIComponent(tag.displayName)}`}
                            >
                                {tag.displayName}
                            </Tag>
                        ))}
                </div>
            )}
        </div>
    );
}
