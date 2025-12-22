"use client";

import { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";
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
    DialogAlert,
    dialogInputClass,
} from "@/components/ui/Dialog";

interface TagModalProps {
    isOpen: boolean;
    onClose: () => void;
    tag: { id: string; category: string; value: string; displayName: string; color?: string | null } | null;
    onSave: (data: { category: string; value: string; displayName: string; color?: string }) => Promise<void>;
    initialCategory?: string;
    existingCategories: string[];
}

export default function TagModal({ isOpen, onClose, tag, onSave, initialCategory, existingCategories }: TagModalProps) {
    const t = useTranslations('Admin');
    const [category, setCategory] = useState("");
    const [value, setValue] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [color, setColor] = useState("#ffffff");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (tag) {
                setCategory(tag.category);
                setValue(tag.value);
                setDisplayName(tag.displayName);
                setColor(tag.color || "#ffffff");
            } else {
                setCategory(initialCategory || "");
                setValue("");
                setDisplayName("");
                setColor("#ffffff");
            }
        }
    }, [isOpen, tag, initialCategory]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSave({ category, value, displayName, color });
            onClose();
        } catch (error) {
            console.error("Failed to save tag:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredCategories = existingCategories.filter(c =>
        c.toLowerCase().includes(category.toLowerCase())
    );

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent size="md">
                <DialogHeader>
                    <DialogTitle>{tag ? t('editTag') : t('createTag')}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <DialogBody className="space-y-5">
                        {/* Category Input with Autocomplete */}
                        <DialogField label={t('category')}>
                            <div className="relative">
                                <input
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
                        <DialogField label={t('value')}>
                            <input
                                type="text"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                placeholder="e.g. survival_mode"
                                required
                                className={`${dialogInputClass} font-mono`}
                            />
                        </DialogField>

                        {/* Display Name Input */}
                        <DialogField label={t('displayName')}>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="e.g. Survival Mode"
                                required
                                className={dialogInputClass}
                            />
                        </DialogField>

                        {/* Color Input - hidden for gamever category */}
                        {category !== 'gamever' ? (
                            <DialogField label={t('color')}>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={color}
                                        onChange={(e) => setColor(e.target.value)}
                                        className="h-10 w-20 bg-transparent border-none cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={color}
                                        onChange={(e) => setColor(e.target.value)}
                                        pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                                        className={`${dialogInputClass} flex-1 font-mono uppercase`}
                                    />
                                </div>
                            </DialogField>
                        ) : (
                            <DialogAlert variant="info">
                                ℹ️ Game version colors are automatically calculated based on version order (newest = green, oldest = red).
                            </DialogAlert>
                        )}
                    </DialogBody>

                    <DialogFooter>
                        <DialogButton type="button" variant="ghost" onClick={onClose}>
                            {t('cancel')}
                        </DialogButton>
                        <DialogButton type="submit" variant="primary" loading={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    {t('saving')}
                                </>
                            ) : (
                                <>
                                    <Save size={16} />
                                    {t('save')}
                                </>
                            )}
                        </DialogButton>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
