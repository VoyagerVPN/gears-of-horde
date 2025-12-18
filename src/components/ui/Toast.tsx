"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Check, Info, AlertTriangle, Cloud } from "lucide-react";

export type ToastVariant = "success" | "info" | "warning" | "autosave";

interface ToastProps {
    message: string;
    variant?: ToastVariant;
    duration?: number;
    isVisible: boolean;
    onClose: () => void;
}

const variantConfig: Record<ToastVariant, { bg: string; border: string; iconColor: string; Icon: typeof Check }> = {
    success: {
        bg: "rgba(34, 197, 94, 0.1)",
        border: "rgba(34, 197, 94, 0.3)",
        iconColor: "#4ade80",
        Icon: Check,
    },
    info: {
        bg: "rgba(59, 130, 246, 0.1)",
        border: "rgba(59, 130, 246, 0.3)",
        iconColor: "#60a5fa",
        Icon: Info,
    },
    warning: {
        bg: "rgba(245, 158, 11, 0.1)",
        border: "rgba(245, 158, 11, 0.3)",
        iconColor: "#fbbf24",
        Icon: AlertTriangle,
    },
    autosave: {
        bg: "rgba(16, 185, 129, 0.1)",
        border: "rgba(16, 185, 129, 0.3)",
        iconColor: "#34d399",
        Icon: Cloud,
    },
};

export function Toast({
    message,
    variant = "info",
    duration = 3000,
    isVisible,
    onClose,
}: ToastProps) {
    const [mounted, setMounted] = useState(false);
    const [isShowing, setIsShowing] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        if (isVisible && mounted) {
            // Small delay for enter animation
            requestAnimationFrame(() => setIsShowing(true));

            const timer = setTimeout(() => {
                setIsShowing(false);
                setTimeout(onClose, 200); // Wait for exit animation
            }, duration);

            return () => clearTimeout(timer);
        } else {
            setIsShowing(false);
        }
    }, [isVisible, duration, onClose, mounted]);

    if (!isVisible || !mounted) return null;

    const config = variantConfig[variant];
    const IconComponent = config.Icon;

    // Using inline styles for portal content to ensure reliable rendering
    const toastContent = (
        <div
            style={{
                position: 'fixed',
                top: '16px',
                right: '16px',
                zIndex: 100000,
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 16px',
                borderRadius: '12px',
                backgroundColor: config.bg,
                border: `1px solid ${config.border}`,
                backdropFilter: 'blur(8px)',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                transform: isShowing ? 'translateX(0)' : 'translateX(20px)',
                opacity: isShowing ? 1 : 0,
                transition: 'all 200ms ease-out',
            }}
        >
            <IconComponent size={16} style={{ color: config.iconColor }} />
            <span style={{ fontSize: '14px', color: 'white', fontWeight: 500 }}>
                {message}
            </span>
            <button
                onClick={() => {
                    setIsShowing(false);
                    setTimeout(onClose, 200);
                }}
                style={{
                    marginLeft: '8px',
                    padding: '4px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <X size={14} style={{ color: '#a1a1a1' }} />
            </button>
        </div>
    );

    return createPortal(toastContent, document.body);
}

// Hook for easier toast management
export function useToast() {
    const [toast, setToast] = useState<{
        message: string;
        variant: ToastVariant;
        key: number;
    } | null>(null);

    const showToast = (message: string, variant: ToastVariant = "info") => {
        setToast({ message, variant, key: Date.now() });
    };

    const hideToast = () => {
        setToast(null);
    };

    return { toast, showToast, hideToast };
}
