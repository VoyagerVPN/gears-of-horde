"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Check, Info, AlertTriangle, Cloud, XCircle } from "lucide-react";

export type ToastVariant = "success" | "info" | "warning" | "error" | "autosave";

interface ToastItem {
    id: number;
    message: string;
    variant: ToastVariant;
}

interface ToastContextValue {
    showToast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const variantConfig: Record<ToastVariant, { bg: string; border: string; iconColor: string; Icon: typeof Check }> = {
    success: {
        bg: "#1a2e1a",
        border: "#2d4a2d",
        iconColor: "#4ade80",
        Icon: Check,
    },
    info: {
        bg: "#1a1a2e",
        border: "#2d2d4a",
        iconColor: "#60a5fa",
        Icon: Info,
    },
    warning: {
        bg: "#2e2a1a",
        border: "#4a3d2d",
        iconColor: "#fbbf24",
        Icon: AlertTriangle,
    },
    error: {
        bg: "#2e1a1a",
        border: "#4a2d2d",
        iconColor: "#f87171",
        Icon: XCircle,
    },
    autosave: {
        bg: "#1a2e2a",
        border: "#2d4a3d",
        iconColor: "#34d399",
        Icon: Cloud,
    },
};

function ToastItemComponent({
    toast,
    onClose,
}: {
    toast: ToastItem;
    onClose: (id: number) => void;
}) {
    const [isShowing, setIsShowing] = useState(false);

    useEffect(() => {
        // Animate in
        requestAnimationFrame(() => setIsShowing(true));

        // Auto-dismiss after 4 seconds
        const timer = setTimeout(() => {
            setIsShowing(false);
            setTimeout(() => onClose(toast.id), 200);
        }, 4000);

        return () => clearTimeout(timer);
    }, [toast.id, onClose]);

    const config = variantConfig[toast.variant];
    const IconComponent = config.Icon;

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 16px',
                borderRadius: '12px',
                backgroundColor: config.bg,
                border: `1px solid ${config.border}`,
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                transform: isShowing ? 'translateX(0)' : 'translateX(20px)',
                opacity: isShowing ? 1 : 0,
                transition: 'all 200ms ease-out',
                marginBottom: '8px',
            }}
        >
            <IconComponent size={16} style={{ color: config.iconColor, flexShrink: 0 }} />
            <span style={{ fontSize: '14px', color: 'white', fontWeight: 500 }}>
                {toast.message}
            </span>
            <button
                onClick={() => {
                    setIsShowing(false);
                    setTimeout(() => onClose(toast.id), 200);
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
                    flexShrink: 0,
                }}
            >
                <X size={14} style={{ color: '#a1a1a1' }} />
            </button>
        </div>
    );
}

let toastIdCounter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const showToast = useCallback((message: string, variant: ToastVariant = "info") => {
        const id = ++toastIdCounter;
        setToasts((prev) => [{ id, message, variant }, ...prev]);
    }, []);

    const removeToast = useCallback((id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const toastContainer = mounted && toasts.length > 0 ? createPortal(
        <div
            style={{
                position: 'fixed',
                top: '16px',
                right: '16px',
                zIndex: 100000,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
            }}
        >
            {toasts.map((toast) => (
                <ToastItemComponent key={toast.id} toast={toast} onClose={removeToast} />
            ))}
        </div>,
        document.body
    ) : null;

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {toastContainer}
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}
