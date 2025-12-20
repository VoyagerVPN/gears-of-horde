"use client";

import { useEffect, useState, ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

// ============================================================================
// MODAL STYLES (Shared across all modals)
// ============================================================================

export const modalStyles = {
    overlay: {
        position: 'fixed' as const,
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
    },
    container: {
        width: '100%',
        maxWidth: '448px',
        backgroundColor: '#1a1a1a',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column' as const,
        maxHeight: '90vh',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    },
    headerWithBg: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    title: {
        fontSize: '18px',
        fontWeight: 'bold' as const,
        color: 'white',
        margin: 0,
    },
    closeButton: {
        background: 'none',
        border: 'none',
        color: '#a1a1a1',
        cursor: 'pointer',
        padding: '4px',
    },
    content: {
        padding: '24px',
        overflowY: 'auto' as const,
    },
    footer: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px',
        paddingTop: '16px',
    },
    // Form elements
    label: {
        display: 'block',
        fontSize: '14px',
        fontWeight: 500,
        color: '#a1a1a1',
        marginBottom: '8px',
    },
    labelSmall: {
        display: 'block',
        fontSize: '10px',
        fontWeight: 'bold' as const,
        color: '#a1a1a1',
        textTransform: 'uppercase' as const,
        marginBottom: '4px',
    },
    input: {
        width: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        padding: '10px 16px',
        color: 'white',
        fontSize: '14px',
        outline: 'none',
        boxSizing: 'border-box' as const,
    },
    inputMono: {
        width: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        padding: '10px 16px',
        color: 'white',
        fontSize: '14px',
        fontFamily: 'monospace',
        outline: 'none',
        boxSizing: 'border-box' as const,
    },
    select: {
        width: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        padding: '8px 16px',
        color: 'white',
        fontSize: '14px',
        outline: 'none',
        boxSizing: 'border-box' as const,
    },
    // Buttons
    cancelButton: {
        padding: '8px 16px',
        fontSize: '14px',
        fontWeight: 500,
        color: '#a1a1a1',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
    },
    primaryButton: {
        padding: '8px 24px',
        backgroundColor: '#ce4729',
        color: 'white',
        fontSize: '14px',
        fontWeight: 'bold' as const,
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    warningButton: {
        padding: '8px 16px',
        backgroundColor: '#ca8a04',
        color: 'white',
        fontSize: '14px',
        fontWeight: 'bold' as const,
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
    },
    // Alerts
    warningBox: {
        backgroundColor: 'rgba(234, 179, 8, 0.1)',
        border: '1px solid rgba(234, 179, 8, 0.2)',
        borderRadius: '8px',
        padding: '16px',
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
    },
    infoBox: {
        marginBottom: '20px',
        padding: '12px 16px',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        borderRadius: '8px',
        fontSize: '13px',
        color: 'rgba(147, 197, 253, 0.9)',
    },
    // Field spacing
    fieldGroup: {
        marginBottom: '20px',
    },
} as const;

// ============================================================================
// MODAL COMPONENT
// ============================================================================

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    /** Use header with background color */
    headerWithBg?: boolean;
    /** Custom max width */
    maxWidth?: string;
}

/**
 * Reusable Modal Base Component
 * 
 * Use this as a base for all modal dialogs in the admin section.
 * Provides consistent styling and behavior.
 * 
 * @example
 * ```tsx
 * <Modal isOpen={isOpen} onClose={handleClose} title="Edit Tag">
 *   <form onSubmit={handleSubmit}>
 *     <div style={modalStyles.fieldGroup}>
 *       <label style={modalStyles.label}>Name</label>
 *       <input style={modalStyles.input} value={name} onChange={...} />
 *     </div>
 *     <div style={modalStyles.footer}>
 *       <button style={modalStyles.cancelButton} onClick={handleClose}>Cancel</button>
 *       <button style={modalStyles.primaryButton} type="submit">Save</button>
 *     </div>
 *   </form>
 * </Modal>
 * ```
 */
export default function Modal({ 
    isOpen, 
    onClose, 
    title, 
    children,
    headerWithBg = false,
    maxWidth = '448px'
}: ModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen || !mounted) return null;

    const modalContent = (
        <div
            style={modalStyles.overlay}
            onClick={onClose}
        >
            <div
                style={{ ...modalStyles.container, maxWidth }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div style={headerWithBg ? modalStyles.headerWithBg : modalStyles.header}>
                    <h2 style={modalStyles.title}>{title}</h2>
                    <button
                        onClick={onClose}
                        style={modalStyles.closeButton}
                        type="button"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div style={modalStyles.content}>
                    {children}
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

interface ModalFooterProps {
    children: ReactNode;
}

export function ModalFooter({ children }: ModalFooterProps) {
    return <div style={modalStyles.footer}>{children}</div>;
}

interface ModalFieldProps {
    label: string;
    children: ReactNode;
    smallLabel?: boolean;
}

export function ModalField({ label, children, smallLabel = false }: ModalFieldProps) {
    return (
        <div style={modalStyles.fieldGroup}>
            <label style={smallLabel ? modalStyles.labelSmall : modalStyles.label}>
                {label}
            </label>
            {children}
        </div>
    );
}
