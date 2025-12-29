"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from 'next-intl';
import { CircleUser, Gamepad2, Globe, Newspaper, Tag as TagIcon, LucideIcon } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogBody,
    DialogFooter,
    DialogButton,
    DialogField,
    dialogInputClass,
} from "@/components/ui/Dialog";
import RichSelector, { RichSelectorOption } from "@/components/ui/RichSelector";

interface TagModalProps {
    isOpen: boolean;
    onClose: () => void;
    tag: { id: string; category: string; value: string; displayName: string } | null;
    onSave: (data: { category: string; value: string; displayName: string }) => Promise<void>;
    initialCategory?: string;
    existingCategories: string[];
}

// Configuration for fixed categories with specific styling
const CATEGORY_CONFIG: Record<string, { icon: LucideIcon; color: string; labelKey: string }> = {
    author: { icon: CircleUser, color: "text-blue-400", labelKey: "author" },
    gamever: { icon: Gamepad2, color: "text-green-500", labelKey: "gameVersion" },
    lang: { icon: Globe, color: "text-primary", labelKey: "language" },
    newscat: { icon: Newspaper, color: "text-violet-400", labelKey: "news" },
    tag: { icon: TagIcon, color: "text-zinc-400", labelKey: "tags" },
};

export default function TagModal({ isOpen, onClose, tag, onSave, initialCategory, existingCategories }: TagModalProps) {
    const t = useTranslations('Admin');
    const t_common = useTranslations('Common');
    const [category, setCategory] = useState("");
    const [value, setValue] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (tag) {
                setCategory(tag.category);
                setValue(tag.value);
                setDisplayName(tag.displayName);
            } else {
                setCategory(initialCategory || "");
                setValue("");
                setDisplayName("");
            }
        }
    }, [isOpen, tag, initialCategory]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await onSave({ category, value, displayName });
            onClose();
        } catch (error) {
            console.error("Failed to save tag:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Generate options merging hardcoded config with any existing custom categories
    const categoryOptions: RichSelectorOption[] = useMemo(() => {
        // Start with the fixed categories
        const fixedCategories = Object.entries(CATEGORY_CONFIG).map(([key, config]) => ({
            value: key,
            label: t(config.labelKey) || key.charAt(0).toUpperCase() + key.slice(1), // Fallback to capitalized key
            icon: config.icon,
            iconColor: config.color,
            isCurrent: tag?.category === key,
        }));

        // Find any existing categories that aren't in the fixed list
        const extraCategories = existingCategories
            .filter(cat => !CATEGORY_CONFIG[cat])
            .map(cat => ({
                value: cat,
                label: cat, // Use raw category name
                icon: TagIcon, // Default icon
                iconColor: "text-zinc-400", // Neutral color
                isCurrent: tag?.category === cat,
            }));

        return [...fixedCategories, ...extraCategories];
    }, [existingCategories, tag?.category, t]);

    const isDisabled = isLoading || !category.trim() || !value.trim() || !displayName.trim();

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent size="md">
                <DialogHeader>
                    <DialogTitle>{tag ? t('editTag') : t('createTag')}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <DialogBody className="space-y-4">
                        {/* Category Selector */}
                        <DialogField label={t('category')} smallLabel>
                            <RichSelector
                                value={category}
                                onChange={setCategory}
                                options={categoryOptions}
                                placeholder={t('selectCategory')}
                                currentLabel={t_common('current')}
                            />
                        </DialogField>

                        {/* Value Input */}
                        <DialogField label={t('value')} smallLabel>
                            <input
                                id="tag-value"
                                name="value"
                                type="text"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                placeholder="e.g. survival_mode"
                                required
                                className={dialogInputClass}
                            />
                        </DialogField>

                        {/* Display Name Input */}
                        <DialogField label={t('displayName')} smallLabel>
                            <input
                                id="tag-display-name"
                                name="displayName"
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="e.g. Survival Mode"
                                required
                                maxLength={25}
                                className={dialogInputClass}
                            />
                        </DialogField>
                    </DialogBody>

                    <DialogFooter>
                        <DialogButton type="button" variant="ghost" onClick={onClose}>
                            {t('cancel')}
                        </DialogButton>
                        <DialogButton
                            type="submit"
                            variant="primary"
                            disabled={isDisabled}
                            loading={isLoading}
                        >
                            {isLoading ? t('saving') : t('save')}
                        </DialogButton>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
