"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, ArrowRight, AlertTriangle } from "lucide-react";
import { TagData } from "@/app/actions/tag-actions";

interface MergeTagModalProps {
    isOpen: boolean;
    onClose: () => void;
    sourceTag: TagData | null;
    allTags: TagData[];
    onMerge: (targetId: string) => Promise<void>;
}

export default function MergeTagModal({ isOpen, onClose, sourceTag, allTags, onMerge }: MergeTagModalProps) {
    const [targetId, setTargetId] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!isOpen || !sourceTag || !mounted) return null;

    const availableTargets = allTags.filter(t => t.id !== sourceTag.id && t.category === sourceTag.category);

    const handleSubmit = async () => {
        if (!targetId) return;
        if (!confirm(`Are you sure you want to merge "${sourceTag.displayName}" into the selected tag? This cannot be undone.`)) return;

        setIsSubmitting(true);
        try {
            await onMerge(targetId);
            onClose();
        } catch (error) {
            console.error("Failed to merge tags:", error);
            alert("Failed to merge tags");
        } finally {
            setIsSubmitting(false);
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
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 24px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: 'white', margin: 0 }}>
                        Merge Tags
                    </h2>
                    <button
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', color: '#a1a1a1', cursor: 'pointer', padding: '4px' }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: '24px' }}>
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
                        <div style={{ fontSize: '14px', color: 'rgba(254, 240, 138, 0.8)' }}>
                            <p style={{ fontWeight: 'bold', color: '#eab308', marginBottom: '4px', marginTop: 0 }}>Warning</p>
                            <p style={{ margin: 0 }}>
                                Merging will reassign all mods and news from <strong>{sourceTag.displayName}</strong> to the target tag, and then <strong>permanently delete</strong> the source tag.
                            </p>
                        </div>
                    </div>

                    {/* Source -> Target */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
                        <div style={{
                            flex: 1,
                            padding: '12px',
                            backgroundColor: 'rgba(0, 0, 0, 0.2)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '8px',
                            textAlign: 'center',
                        }}>
                            <div style={{ fontSize: '10px', color: '#a1a1a1', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '4px' }}>Source</div>
                            <div style={{ fontWeight: 'bold', color: 'white' }}>{sourceTag.displayName}</div>
                        </div>
                        <ArrowRight style={{ color: '#a1a1a1' }} />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '10px', color: '#a1a1a1', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '4px', textAlign: 'center' }}>Target</div>
                            <select
                                value={targetId}
                                onChange={(e) => setTargetId(e.target.value)}
                                style={{
                                    width: '100%',
                                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '8px',
                                    padding: '8px 12px',
                                    fontSize: '14px',
                                    color: 'white',
                                    outline: 'none',
                                }}
                            >
                                <option value="">Select Target...</option>
                                {availableTargets.map(tag => (
                                    <option key={tag.id} value={tag.id}>{tag.displayName}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px' }}>
                        <button
                            onClick={onClose}
                            style={{ padding: '8px 16px', fontSize: '14px', fontWeight: 500, color: '#a1a1a1', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={!targetId || isSubmitting}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#ce4729',
                                color: 'white',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                borderRadius: '8px',
                                border: 'none',
                                cursor: (!targetId || isSubmitting) ? 'not-allowed' : 'pointer',
                                opacity: (!targetId || isSubmitting) ? 0.5 : 1,
                            }}
                        >
                            {isSubmitting ? "Merging..." : "Merge Tags"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
