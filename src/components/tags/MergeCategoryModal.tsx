"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, AlertTriangle } from "lucide-react";
import { useTranslations } from 'next-intl';

interface MergeCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    sourceCategory: string | null;
    allCategories: string[];
    onMerge: (targetCategory: string) => Promise<void>;
}

export default function MergeCategoryModal({ isOpen, onClose, sourceCategory, allCategories, onMerge }: MergeCategoryModalProps) {
    const t = useTranslations('Admin');
    const [targetCategory, setTargetCategory] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!isOpen || !sourceCategory || !mounted) return null;

    const availableTargets = allCategories.filter(c => c !== sourceCategory);

    const handleMerge = async () => {
        if (!targetCategory) return;
        if (!confirm(t('mergeCategoryConfirm'))) return;

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

    const modalContent = (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 99999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(4px)',
                padding: '16px',
            }}
            onClick={onClose}
        >
            <div
                style={{
                    width: '100%',
                    maxWidth: '448px',
                    backgroundColor: '#1a1a1a',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: 'white', margin: 0 }}>
                        {t('mergeCategories')}
                    </h2>
                    <button
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', color: '#a1a1a1', cursor: 'pointer', padding: '4px' }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: '16px' }}>
                    {/* Warning */}
                    <div style={{
                        backgroundColor: 'rgba(234, 179, 8, 0.1)',
                        border: '1px solid rgba(234, 179, 8, 0.2)',
                        borderRadius: '8px',
                        padding: '16px',
                        display: 'flex',
                        gap: '12px',
                        marginBottom: '24px',
                    }}>
                        <AlertTriangle style={{ color: '#eab308', flexShrink: 0 }} size={20} />
                        <div>
                            <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#fef08a', marginTop: 0, marginBottom: '4px' }}>
                                {t('warning')}
                            </p>
                            <p style={{ fontSize: '12px', color: 'rgba(254, 240, 138, 0.7)', margin: 0 }}>
                                {t('mergeCategoryWarning', { category: sourceCategory })}
                            </p>
                        </div>
                    </div>

                    {/* Source Category */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            color: '#a1a1a1',
                            textTransform: 'uppercase',
                            marginBottom: '4px',
                        }}>
                            {t('sourceCategory')}
                        </label>
                        <div style={{
                            width: '100%',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '8px',
                            padding: '8px 16px',
                            color: 'white',
                            opacity: 0.5,
                            boxSizing: 'border-box',
                        }}>
                            {sourceCategory}
                        </div>
                    </div>

                    {/* Arrow divider */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                        <div style={{ width: '1px', height: '32px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
                    </div>

                    {/* Target Category */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            color: '#a1a1a1',
                            textTransform: 'uppercase',
                            marginBottom: '4px',
                        }}>
                            {t('targetCategory')}
                        </label>
                        <select
                            value={targetCategory}
                            onChange={(e) => setTargetCategory(e.target.value)}
                            style={{
                                width: '100%',
                                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '8px',
                                padding: '8px 16px',
                                color: 'white',
                                fontSize: '14px',
                                outline: 'none',
                                boxSizing: 'border-box',
                            }}
                        >
                            <option value="">{t('selectCategory')}</option>
                            {availableTargets.map(cat => (
                                <option key={cat} value={cat} style={{ backgroundColor: '#27272a' }}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Buttons */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '8px' }}>
                        <button
                            onClick={onClose}
                            style={{ padding: '8px 16px', fontSize: '14px', fontWeight: 'bold', color: '#a1a1a1', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                            {t('cancel')}
                        </button>
                        <button
                            onClick={handleMerge}
                            disabled={isLoading || !targetCategory}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#ca8a04',
                                color: 'white',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                borderRadius: '8px',
                                border: 'none',
                                cursor: (isLoading || !targetCategory) ? 'not-allowed' : 'pointer',
                                opacity: (isLoading || !targetCategory) ? 0.5 : 1,
                            }}
                        >
                            {isLoading ? t('merging') : t('merge')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
