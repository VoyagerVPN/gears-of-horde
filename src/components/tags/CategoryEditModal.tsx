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
} from "@/shared/ui";

interface CategoryEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    category: string | null;
    onSave: (oldCategory: string, newCategory: string) => Promise<void>;
}

export default function CategoryEditModal({ isOpen, onClose, category, onSave }: CategoryEditModalProps) {
    const t = useTranslations('Admin');
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (category) {
            setName(category);
        }
    }, [category]);

    if (!category) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await onSave(category, name);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const isDisabled = isLoading || !name.trim() || name === category;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent size="md">
                <DialogHeader>
                    <DialogTitle>{t('editCategory')}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <DialogBody>
                        <DialogField label={t('categoryName')} smallLabel>
                            <input
                                id="category-name"
                                name="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
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
