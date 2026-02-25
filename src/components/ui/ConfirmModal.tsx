"use client";

import { AlertTriangle } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogBody,
    DialogFooter,
    DialogButton,
} from "@/shared/ui";

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "warning" | "danger" | "default";
    /** If true, removes the backdrop blur and dimming (useful for nested modals) */
    nested?: boolean;
}

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "warning",
    nested = false,
}: ConfirmModalProps) {
    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    const iconColor = variant === "danger" ? "text-red-500" :
        variant === "warning" ? "text-yellow-500" : "text-primary";

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                size="sm"
                overlayClassName={nested ? "!bg-transparent !backdrop-blur-none" : ""}
                className={nested ? "shadow-2xl border-white/20" : ""}
            >
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        <AlertTriangle size={20} className={iconColor} />
                        {title || "Confirm"}
                    </DialogTitle>
                </DialogHeader>

                <DialogBody>
                    <p className="text-sm text-textMuted">{message}</p>
                </DialogBody>

                <DialogFooter>
                    <DialogButton variant="ghost" onClick={onClose}>
                        {cancelText}
                    </DialogButton>
                    <DialogButton
                        variant={variant === "danger" ? "danger" : "primary"}
                        onClick={handleConfirm}
                    >
                        {confirmText}
                    </DialogButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
