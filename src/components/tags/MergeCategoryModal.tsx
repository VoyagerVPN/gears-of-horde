"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
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
    dialogSelectClass,
} from "@/components/ui/Dialog";

interface MergeCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    sourceCategory: string | null;
    allCategories: string[];
    onMerge: (targetCategory: string) => Promise<void>;
}

import ConfirmModal from "@/components/ui/ConfirmModal";

export default function MergeCategoryModal({ isOpen, onClose, sourceCategory, allCategories, onMerge }: MergeCategoryModalProps) {
    const t = useTranslations('Admin');
    const [targetCategory, setTargetCategory] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    if (!sourceCategory) return null;

    const availableTargets = allCategories.filter(c => c !== sourceCategory);
    
    const handleMergeClick = () => {
        if (!targetCategory) return;
        setIsConfirmOpen(true);
    };

    const handleConfirmMerge = async () => {
        if (!targetCategory) return;

        setIsLoading(true);
        try {
            await onMerge(targetCategory);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <DialogContent size="md">
                    <DialogHeader>
                        <DialogTitle>{t('mergeCategories')}</DialogTitle>
                    </DialogHeader>

                    <DialogBody className="space-y-5">
                        {/* Warning */}
                        <DialogAlert variant="warning" icon={<AlertTriangle size={20} />}>
                            <p className="font-bold text-yellow-400 mb-1">{t('warning')}</p>
                            <p className="text-sm">{t('mergeCategoryWarning', { category: sourceCategory })}</p>
                        </DialogAlert>

                        {/* Source Category */}
                        <DialogField label={t('sourceCategory')} smallLabel>
                            <div className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-4 text-white opacity-50">
                                {sourceCategory}
                            </div>
                        </DialogField>

                        {/* Arrow divider */}
                        <div className="flex justify-center">
                            <div className="w-px h-8 bg-white/10" />
                        </div>

                        {/* Target Category */}
                        <DialogField label={t('targetCategory')} smallLabel>
                            <select
                                value={targetCategory}
                                onChange={(e) => setTargetCategory(e.target.value)}
                                className={dialogSelectClass}
                            >
                                <option value="">{t('selectCategory')}</option>
                                {availableTargets.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </DialogField>
                    </DialogBody>

                    <DialogFooter>
                        <DialogButton type="button" variant="ghost" onClick={onClose}>
                            {t('cancel')}
                        </DialogButton>
                        <DialogButton
                            type="button"
                            variant="warning"
                            disabled={!targetCategory}
                            loading={isLoading}
                            onClick={handleMergeClick}
                        >
                            {isLoading ? t('merging') : t('merge')}
                        </DialogButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleConfirmMerge}
                title={t('mergeCategories')}
                message={t('mergeCategoryConfirm')}
                confirmText={t('merge')}
                cancelText={t('cancel')}
                variant="warning"
                nested={true}
            />
        </>
    );
}
