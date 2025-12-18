"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, History, RotateCcw, Trash2, AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import { DraftData } from "@/hooks/useAutosave";

interface DraftHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    draftHistory: DraftData[];
    onRestore: (draftId: string) => void;
    onDelete: (draftId: string) => void;
    onClearAll: () => void;
}

function formatRelativeTime(isoDate: string): string {
    const now = new Date();
    const date = new Date(isoDate);
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

    return date.toLocaleDateString();
}

function formatFullDate(isoDate: string): string {
    const date = new Date(isoDate);
    return date.toLocaleString();
}

export default function DraftHistoryModal({
    isOpen,
    onClose,
    draftHistory,
    onRestore,
    onDelete,
    onClearAll,
}: DraftHistoryModalProps) {
    const t = useTranslations("Admin");
    const [mounted, setMounted] = useState(false);
    const [confirmClearAll, setConfirmClearAll] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        if (!isOpen) {
            setConfirmClearAll(false);
        }
    }, [isOpen]);

    if (!isOpen || !mounted) return null;

    const handleRestore = (draftId: string) => {
        onRestore(draftId);
        onClose();
    };

    const handleClearAll = () => {
        if (confirmClearAll) {
            onClearAll();
            onClose();
        } else {
            setConfirmClearAll(true);
        }
    };

    // Using inline styles for portal content to ensure reliable rendering
    // (Portal renders outside React tree, which can cause CSS scope issues)
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
                    maxWidth: '500px',
                    backgroundColor: '#1a1a1a',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    maxHeight: '80vh',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '20px 24px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <History size={20} style={{ color: '#ce4729' }} />
                        <h2 style={{
                            fontSize: '18px',
                            fontWeight: 'bold',
                            color: 'white',
                            margin: 0,
                            fontFamily: 'Exo 2, sans-serif',
                        }}>
                            {t("draftHistory")}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#a1a1a1',
                            cursor: 'pointer',
                            padding: '8px',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div style={{
                    padding: '24px',
                    overflowY: 'auto',
                    flex: 1,
                }}>
                    {draftHistory.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '32px 0' }}>
                            <History size={40} style={{ color: 'rgba(161, 161, 161, 0.3)', marginBottom: '12px' }} />
                            <p style={{ color: '#a1a1a1', fontSize: '14px', margin: 0 }}>
                                {t("noDraftsFound")}
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {draftHistory.map((draft, index) => (
                                <div
                                    key={draft.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '16px',
                                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                        border: '1px solid rgba(255, 255, 255, 0.05)',
                                        borderRadius: '12px',
                                    }}
                                >
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{
                                                fontSize: '14px',
                                                fontWeight: 500,
                                                color: 'white',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}>
                                                {draft.data.title || "Untitled"}
                                            </span>
                                            {index === 0 && (
                                                <span style={{
                                                    padding: '2px 8px',
                                                    fontSize: '10px',
                                                    fontWeight: 'bold',
                                                    backgroundColor: 'rgba(206, 71, 41, 0.2)',
                                                    color: '#ce4729',
                                                    borderRadius: '9999px',
                                                    textTransform: 'uppercase',
                                                }}>
                                                    Latest
                                                </span>
                                            )}
                                        </div>
                                        <p
                                            style={{
                                                fontSize: '12px',
                                                color: '#a1a1a1',
                                                margin: '4px 0 0 0',
                                            }}
                                            title={formatFullDate(draft.savedAt)}
                                        >
                                            {formatRelativeTime(draft.savedAt)}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <button
                                            onClick={() => handleRestore(draft.id)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                padding: '8px',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                            title={t("restoreVersion")}
                                        >
                                            <RotateCcw size={14} style={{ color: '#4ade80' }} />
                                        </button>
                                        <button
                                            onClick={() => onDelete(draft.id)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                padding: '8px',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                            title={t("deleteVersion")}
                                        >
                                            <Trash2 size={14} style={{ color: '#f87171' }} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {draftHistory.length > 0 && (
                    <div style={{
                        padding: '16px 24px',
                        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}>
                        <span style={{ fontSize: '12px', color: '#a1a1a1' }}>
                            {draftHistory.length} version{draftHistory.length !== 1 ? "s" : ""} saved
                        </span>
                        <button
                            onClick={handleClearAll}
                            style={{
                                padding: '8px 16px',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                borderRadius: '8px',
                                border: confirmClearAll ? 'none' : '1px solid rgba(248, 113, 113, 0.3)',
                                backgroundColor: confirmClearAll ? '#ef4444' : 'transparent',
                                color: confirmClearAll ? 'white' : '#f87171',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                            }}
                        >
                            {confirmClearAll ? (
                                <>
                                    <AlertTriangle size={14} />
                                    {t("clearAllDrafts")}?
                                </>
                            ) : (
                                <>
                                    <Trash2 size={14} />
                                    {t("clearAllDrafts")}
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
