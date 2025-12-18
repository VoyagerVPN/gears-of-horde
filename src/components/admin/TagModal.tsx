"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Save, Loader2 } from "lucide-react";
import { useTranslations } from 'next-intl';

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
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

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

    if (!isOpen || !mounted) return null;

    const filteredCategories = existingCategories.filter(c =>
        c.toLowerCase().includes(category.toLowerCase())
    );

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
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
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
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    maxHeight: '90vh',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '24px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                }}>
                    <h2 style={{
                        fontSize: '20px',
                        fontWeight: 'bold',
                        color: 'white',
                        margin: 0,
                    }}>
                        {tag ? t('editTag') : t('createTag')}
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#a1a1a1',
                            cursor: 'pointer',
                            padding: '4px',
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ padding: '24px', overflowY: 'auto' }}>
                    {/* Category Input */}
                    <div style={{ marginBottom: '20px', position: 'relative' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: 500,
                            color: '#a1a1a1',
                            marginBottom: '8px',
                        }}>
                            {t('category')}
                        </label>
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
                            style={{
                                width: '100%',
                                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '8px',
                                padding: '10px 16px',
                                color: 'white',
                                fontSize: '14px',
                                outline: 'none',
                                boxSizing: 'border-box',
                            }}
                        />
                        {showCategorySuggestions && filteredCategories.length > 0 && (
                            <div style={{
                                position: 'absolute',
                                zIndex: 10,
                                width: '100%',
                                marginTop: '4px',
                                backgroundColor: '#27272a',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '8px',
                                maxHeight: '192px',
                                overflowY: 'auto',
                            }}>
                                {filteredCategories.map((cat) => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => {
                                            setCategory(cat);
                                            setShowCategorySuggestions(false);
                                        }}
                                        style={{
                                            width: '100%',
                                            textAlign: 'left',
                                            padding: '8px 16px',
                                            fontSize: '14px',
                                            color: '#a1a1a1',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Value Input */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: 500,
                            color: '#a1a1a1',
                            marginBottom: '8px',
                        }}>
                            {t('value')}
                        </label>
                        <input
                            type="text"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder="e.g. survival_mode"
                            required
                            style={{
                                width: '100%',
                                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '8px',
                                padding: '10px 16px',
                                color: 'white',
                                fontSize: '14px',
                                fontFamily: 'monospace',
                                outline: 'none',
                                boxSizing: 'border-box',
                            }}
                        />
                    </div>

                    {/* Display Name Input */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: 500,
                            color: '#a1a1a1',
                            marginBottom: '8px',
                        }}>
                            {t('displayName')}
                        </label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="e.g. Survival Mode"
                            required
                            style={{
                                width: '100%',
                                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '8px',
                                padding: '10px 16px',
                                color: 'white',
                                fontSize: '14px',
                                outline: 'none',
                                boxSizing: 'border-box',
                            }}
                        />
                    </div>

                    {/* Color Input - hidden for gamever category */}
                    {category !== 'gamever' ? (
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: 500,
                                color: '#a1a1a1',
                                marginBottom: '8px',
                            }}>
                                {t('color')}
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <input
                                    type="color"
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    style={{
                                        height: '40px',
                                        width: '80px',
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                    }}
                                />
                                <input
                                    type="text"
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                                    style={{
                                        flex: 1,
                                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '8px',
                                        padding: '10px 16px',
                                        color: 'white',
                                        fontSize: '14px',
                                        fontFamily: 'monospace',
                                        textTransform: 'uppercase',
                                        outline: 'none',
                                    }}
                                />
                            </div>
                        </div>
                    ) : (
                        <div style={{
                            marginBottom: '20px',
                            padding: '12px 16px',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            border: '1px solid rgba(59, 130, 246, 0.2)',
                            borderRadius: '8px',
                            fontSize: '13px',
                            color: 'rgba(147, 197, 253, 0.9)',
                        }}>
                            ℹ️ Game version colors are automatically calculated based on version order (newest = green, oldest = red).
                        </div>
                    )}

                    {/* Buttons */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '12px',
                        paddingTop: '16px',
                    }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: 500,
                                color: '#a1a1a1',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                            }}
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            style={{
                                padding: '8px 24px',
                                backgroundColor: '#ce4729',
                                color: 'white',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                borderRadius: '8px',
                                border: 'none',
                                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                opacity: isSubmitting ? 0.7 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                            }}
                        >
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
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
