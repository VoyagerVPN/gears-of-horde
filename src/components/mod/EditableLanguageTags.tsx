"use client";

import { useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { TagData } from '@/types/mod';
import TagSelector from '@/components/TagSelector';
import { useTranslations } from 'next-intl';

interface EditableLanguageTagsProps {
    items: TagData[];
    onChange: (items: TagData[]) => void;
}

export default function EditableLanguageTags({ items, onChange }: EditableLanguageTagsProps) {
    const t = useTranslations('Common');

    // Ensure English is present on mount
    useEffect(() => {
        const hasEnglish = items.some(i => i.displayName === 'English');
        if (!hasEnglish) {
            onChange([{ displayName: 'English', category: 'lang', isExternal: false, externalLink: "" }, ...items]);
        }
    }, []); // Only run on mount

    const handleTagsChange = (incomingTags: { displayName: string; category: string }[]) => {
        // Map incoming tags to existing items to preserve metadata
        const newItems = incomingTags.map(tag => {
            const existing = items.find(i => i.displayName === tag.displayName);
            if (existing) return existing;
            return {
                displayName: tag.displayName,
                category: tag.category,
                isExternal: false,
                externalLink: ""
            };
        });

        // Ensure English is always present and at the top
        const hasEnglish = newItems.some(i => i.displayName === 'English');
        if (!hasEnglish) {
            const existingEnglish = items.find(i => i.displayName === 'English');
            newItems.unshift(existingEnglish || {
                displayName: 'English',
                category: 'lang',
                isExternal: false,
                externalLink: ""
            });
        }

        // Sort languages:
        // 1. English always first
        // 2. Built-in (no URL) before External (has URL)
        // 3. Among external: Russian first
        // 4. Within each group: alphabetical order
        newItems.sort((a, b) => {
            // English always first
            if (a.displayName === 'English') return -1;
            if (b.displayName === 'English') return 1;

            // Check external status (has URL = external)
            const aIsExternal = a.externalLink && a.externalLink.trim().length > 0;
            const bIsExternal = b.externalLink && b.externalLink.trim().length > 0;

            // Built-in before External
            if (!aIsExternal && bIsExternal) return -1;
            if (aIsExternal && !bIsExternal) return 1;

            // Within External: Russian first
            if (aIsExternal && bIsExternal) {
                if (a.displayName === 'Russian') return -1;
                if (b.displayName === 'Russian') return 1;
            }

            // Alphabetical within same group
            return a.displayName.localeCompare(b.displayName);
        });

        onChange(newItems);
    };

    const updateMetadata = (index: number, key: 'isExternal' | 'externalLink', value: any) => {
        const newItems = [...items];
        const updatedItem = { ...newItems[index], [key]: value };

        // Auto-update isExternal based on link presence if updating link
        if (key === 'externalLink') {
            updatedItem.isExternal = typeof value === 'string' && value.trim().length > 0;
        }

        newItems[index] = updatedItem;
        onChange(newItems);
    };

    const removeLanguage = (index: number) => {
        // Prevent removing English
        if (items[index].displayName === 'English') return;
        onChange(items.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-4">
            {/* Persistent Search Bar for adding languages */}
            <TagSelector
                selectedTags={items}
                onTagsChange={handleTagsChange}
                category="lang"
                placeholder={t('searchOrAddTags')}
                showPopular={true}
                hideSelectedTags={true}
                className="space-y-0"
            />

            {/* List of Languages - sorted for display */}
            <div className="bg-surface border border-white/5 rounded-xl overflow-hidden divide-y divide-white/5">
                {[...items]
                    .map((item, originalIdx) => ({ item, originalIdx }))
                    .sort((a, b) => {
                        // English always first
                        if (a.item.displayName === 'English') return -1;
                        if (b.item.displayName === 'English') return 1;

                        // Check external status
                        const aIsExternal = a.item.externalLink && a.item.externalLink.trim().length > 0;
                        const bIsExternal = b.item.externalLink && b.item.externalLink.trim().length > 0;

                        // Built-in before External
                        if (!aIsExternal && bIsExternal) return -1;
                        if (aIsExternal && !bIsExternal) return 1;

                        // Within External: Russian first
                        if (aIsExternal && bIsExternal) {
                            if (a.item.displayName === 'Russian') return -1;
                            if (b.item.displayName === 'Russian') return 1;
                        }

                        // Alphabetical within same group
                        return a.item.displayName.localeCompare(b.item.displayName);
                    })
                    .map(({ item, originalIdx }) => {
                        const isEnglish = item.displayName === 'English';
                        const isExternal = item.externalLink && item.externalLink.trim().length > 0;

                        return (
                            <div key={originalIdx} className="group flex items-center gap-3 px-3 py-2.5 hover:bg-white/[0.03] transition-colors">
                                {/* Language Name as Badge */}
                                <div className="min-w-[100px]">
                                    <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${isExternal ? 'bg-primary/20 text-primary border border-primary/20' : 'bg-zinc-800 text-zinc-400 border border-white/5'}`}>
                                        {item.displayName}
                                    </div>
                                </div>

                                {/* URL Input */}
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={item.externalLink || ''}
                                        onChange={(e) => updateMetadata(originalIdx, 'externalLink', e.target.value)}
                                        disabled={isEnglish}
                                        className={`w-full bg-black/40 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-primary/50 transition-colors placeholder:text-zinc-700 
                                        ${isEnglish ? 'opacity-30 cursor-not-allowed select-none' : 'opacity-100'}`}
                                        placeholder={isEnglish ? "Built-in" : "https://..."}
                                    />
                                </div>

                                {/* Delete Button */}
                                <button
                                    type="button"
                                    onClick={() => removeLanguage(originalIdx)}
                                    disabled={isEnglish}
                                    className={`shrink-0 transition-all p-1 ${isEnglish
                                        ? 'text-transparent cursor-default'
                                        : 'text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 cursor-pointer'
                                        }`}
                                    title={isEnglish ? undefined : t('remove')}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        );
                    })}
            </div>
        </div>
    );
}
