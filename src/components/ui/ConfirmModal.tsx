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
} from "@/components/ui/Dialog";

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "warning" | "danger" | "default";
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
}: ConfirmModalProps) {
    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    const iconColor = variant === "danger" ? "text-red-500" :
        variant === "warning" ? "text-yellow-500" : "text-primary";

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent size="sm">
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
