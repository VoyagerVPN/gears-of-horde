"use client";

import Tag from "@/components/ui/Tag";
import TagSelector from "@/components/TagSelector";
import { ModData } from "@/types/mod";
import { useTranslations } from "next-intl";

interface AuthorEditorProps {
    mod: ModData;
    invalid?: boolean;
    onUpdate: (field: 'tags', value: ModData['tags']) => void;
    onClear: () => void;
}

export default function AuthorEditor({ mod, invalid, onUpdate, onClear }: AuthorEditorProps) {
    const t = useTranslations('Common');

    const authorTags = mod.tags.filter(t => t.category === 'author');
    const nonAuthorTags = mod.tags.filter(t => t.category !== 'author');

    const handleTagsChange = (newAuthorTags: Array<{ displayName: string; category: string }>) => {
        const updatedTags = [
            ...nonAuthorTags,
            ...newAuthorTags.map(t => ({ displayName: t.displayName, category: 'author' as const }))
        ];
        onUpdate('tags', updatedTags);
        onClear();
    };

    const handleRemove = (authorName: string) => {
        const updatedTags = mod.tags.filter(t =>
            !(t.category === 'author' && t.displayName === authorName)
        );
        onUpdate('tags', updatedTags);
        onClear();
    };

    return (
        <div className="flex items-center gap-3">
            <span className="text-textMuted text-xs uppercase tracking-wider font-bold whitespace-nowrap">{t('createdBy')}</span>
            <div className="flex items-center gap-2 flex-wrap">
                {authorTags.map((authorTag) => (
                    <Tag
                        key={authorTag.displayName}
                        category="author"
                        showIcon={true}
                        onRemove={() => handleRemove(authorTag.displayName)}
                    >
                        {authorTag.displayName}
                    </Tag>
                ))}
                {authorTags.length < 5 && (
                    <TagSelector
                        selectedTags={authorTags}
                        onTagsChange={handleTagsChange}
                        category="author"
                        placeholder={t('author')}
                        showPopular={false}
                        maxTags={5}
                        hideSelectedTags={true}
                        compact={true}
                        className="min-w-[80px]"
                        invalid={invalid}
                        onClear={onClear}
                    />
                )}
            </div>
        </div>
    );
}
