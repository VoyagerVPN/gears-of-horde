"use client";

import { useState, useEffect } from "react";
import { useTranslations } from 'next-intl';
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

interface TagModalProps {
    isOpen: boolean;
    onClose: () => void;
    tag: { id: string; category: string; value: string; displayName: string } | null;
    onSave: (data: { category: string; value: string; displayName: string }) => Promise<void>;
    initialCategory?: string;
    existingCategories: string[];
}

export default function TagModal({ isOpen, onClose, tag, onSave, initialCategory, existingCategories }: TagModalProps) {
    const t = useTranslations('Admin');
    const [category, setCategory] = useState("");
    const [value, setValue] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);

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

    const filteredCategories = existingCategories.filter(c =>
        c.toLowerCase().includes(category.toLowerCase())
    );

    const isDisabled = isLoading || !category.trim() || !value.trim() || !displayName.trim();

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent size="md">
                <DialogHeader>
                    <DialogTitle>{tag ? t('editTag') : t('createTag')}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <DialogBody className="space-y-4">
                        {/* Category Input with Autocomplete */}
                        <DialogField label={t('category')} smallLabel>
                            <div className="relative">
                                <input
                                    id="tag-category"
                                    name="category"
                                    type="text"
                                    value={category}
                                    onChange={(e) => {
                                        setCategory(e.target.value);
                                        setShowCategorySuggestions(true);
                                    }}
                                    onFocus={() => setShowCategorySuggestions(true)}
                                    onBlur={() => setTimeout(() => setShowCategorySuggestions(false), 200)}
                                    placeholder={t('selectCategory')}
                                    required
                                    className={dialogInputClass}
                                />
                                {showCategorySuggestions && filteredCategories.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-zinc-800 border border-white/10 rounded-lg max-h-48 overflow-y-auto">
                                        {filteredCategories.map((cat) => (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => {
                                                    setCategory(cat);
                                                    setShowCategorySuggestions(false);
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm text-textMuted hover:bg-white/5 hover:text-white transition-colors"
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
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
