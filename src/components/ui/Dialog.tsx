"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

// ============================================================================
// DIALOG ROOT COMPONENTS (Re-exports from Radix)
// ============================================================================

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogClose = DialogPrimitive.Close;
const DialogPortal = DialogPrimitive.Portal;

// ============================================================================
// DIALOG OVERLAY
// ============================================================================

const DialogOverlay = React.forwardRef<
    React.ComponentRef<typeof DialogPrimitive.Overlay>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className = "", ...props }, ref) => (
    <DialogPrimitive.Overlay
        ref={ref}
        className={`fixed inset-0 z-50 bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 ${className}`}
        {...props}
    />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

// ============================================================================
// DIALOG CONTENT
// ============================================================================

type DialogContentSize = "sm" | "md" | "lg" | "xl" | "2xl" | "6xl" | "full" | "max";

const sizeClasses: Record<DialogContentSize, string> = {
    sm: "max-w-[384px]",
    md: "max-w-[448px]",
    lg: "max-w-[560px]",
    xl: "max-w-[672px]",
    "2xl": "max-w-[800px]",
    "6xl": "max-w-[1152px]",
    full: "max-w-[95vw]",
    max: "max-w-[1400px]",
};

interface DialogContentProps
    extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
    size?: DialogContentSize;
    /** Hide the default close button */
    hideCloseButton?: boolean;
}

const DialogContent = React.forwardRef<
    React.ComponentRef<typeof DialogPrimitive.Content>,
    DialogContentProps
>(({ className = "", size = "md", hideCloseButton = false, children, ...props }, ref) => (
    <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
            ref={ref}
            className={`fixed left-1/2 top-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2 ${sizeClasses[size]} bg-surface border border-white/10 rounded-xl shadow-2xl flex flex-col max-h-[90vh] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 ${className}`}
            {...props}
        >
            {children}
            {!hideCloseButton && (
                <DialogPrimitive.Close className="absolute right-4 top-4 p-1 rounded-md text-textMuted hover:text-white hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50">
                    <X size={18} />
                    <span className="sr-only">Close</span>
                </DialogPrimitive.Close>
            )}
        </DialogPrimitive.Content>
    </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

// ============================================================================
// DIALOG HEADER
// ============================================================================

interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Add background color to header */
    withBg?: boolean;
}

const DialogHeader = React.forwardRef<HTMLDivElement, DialogHeaderProps>(
    ({ className = "", withBg = false, ...props }, ref) => (
        <div
            ref={ref}
            className={`flex flex-col space-y-1.5 p-6 pb-4 ${withBg ? "bg-white/5 border-b border-white/10" : ""} ${className}`}
            {...props}
        />
    )
);
DialogHeader.displayName = "DialogHeader";

// ============================================================================
// DIALOG TITLE
// ============================================================================

const DialogTitle = React.forwardRef<
    React.ComponentRef<typeof DialogPrimitive.Title>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className = "", ...props }, ref) => (
    <DialogPrimitive.Title
        ref={ref}
        className={`text-lg font-bold text-white font-exo2 uppercase tracking-wide ${className}`}
        {...props}
    />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

// ============================================================================
// DIALOG DESCRIPTION
// ============================================================================

const DialogDescription = React.forwardRef<
    React.ComponentRef<typeof DialogPrimitive.Description>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className = "", ...props }, ref) => (
    <DialogPrimitive.Description
        ref={ref}
        className={`text-sm text-textMuted ${className}`}
        {...props}
    />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

// ============================================================================
// DIALOG BODY (Scrollable content area)
// ============================================================================

const DialogBody = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className = "", ...props }, ref) => (
    <div
        ref={ref}
        className={`flex-1 overflow-y-auto p-6 pt-2 custom-scrollbar ${className}`}
        {...props}
    />
));
DialogBody.displayName = "DialogBody";

// ============================================================================
// DIALOG FOOTER
// ============================================================================

const DialogFooter = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className = "", ...props }, ref) => (
    <div
        ref={ref}
        className={`flex justify-end gap-3 p-6 pt-4 border-t border-white/5 ${className}`}
        {...props}
    />
));
DialogFooter.displayName = "DialogFooter";

// ============================================================================
// STYLED BUTTON VARIANTS (for use in dialogs)
// ============================================================================

interface DialogButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "warning" | "danger" | "ghost";
    size?: "sm" | "md";
    loading?: boolean;
}

const DialogButton = React.forwardRef<HTMLButtonElement, DialogButtonProps>(
    ({ className = "", variant = "primary", size = "md", loading = false, disabled, children, ...props }, ref) => {
        const baseClasses = "font-bold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";

        const variantClasses: Record<string, string> = {
            primary: "bg-primary hover:bg-red-600 text-white focus:ring-primary/50",
            secondary: "bg-white/10 hover:bg-white/15 text-white border border-white/10 focus:ring-white/20",
            warning: "bg-yellow-600 hover:bg-yellow-700 text-white focus:ring-yellow-500/50",
            danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500/50",
            ghost: "bg-transparent hover:bg-white/5 text-textMuted hover:text-white focus:ring-white/10",
        };

        const sizeClasses: Record<string, string> = {
            sm: "px-3 py-1.5 text-xs",
            md: "px-4 py-2 text-sm",
        };

        return (
            <button
                ref={ref}
                className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
                disabled={disabled || loading}
                {...props}
            >
                {loading && (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                )}
                {children}
            </button>
        );
    }
);
DialogButton.displayName = "DialogButton";

// ============================================================================
// FORM FIELD HELPERS
// ============================================================================

interface DialogFieldProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Field label */
    label?: string;
    /** Use small uppercase label style */
    smallLabel?: boolean;
    /** Required field indicator */
    required?: boolean;
}

const DialogField = React.forwardRef<HTMLDivElement, DialogFieldProps>(
    ({ className = "", label, smallLabel = false, required = false, children, ...props }, ref) => (
        <div ref={ref} className={`space-y-2 ${className}`} {...props}>
            {label && (
                <label className={smallLabel
                    ? "block text-[10px] font-bold text-textMuted uppercase tracking-wider"
                    : "block text-sm font-medium text-textMuted"
                }>
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            {children}
        </div>
    )
);
DialogField.displayName = "DialogField";

// Input style helper (use as className)
const dialogInputClass = "w-full bg-black/20 border border-white/10 rounded-md py-2.5 px-4 text-sm text-white placeholder:text-textMuted/40 hover:border-white/20 focus:border-white/30 outline-none transition-colors";

// Select style helper
const dialogSelectClass = "w-full bg-black/20 border border-white/10 rounded-md py-2.5 px-4 text-sm text-white hover:border-white/20 focus:border-white/30 outline-none transition-colors appearance-none cursor-pointer";

// ============================================================================
// ALERT BOXES
// ============================================================================

interface DialogAlertProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "info" | "warning" | "danger";
    icon?: React.ReactNode;
}

const DialogAlert = React.forwardRef<HTMLDivElement, DialogAlertProps>(
    ({ className = "", variant = "info", icon, children, ...props }, ref) => {
        const variantClasses: Record<string, string> = {
            info: "bg-blue-500/10 border-blue-500/20 text-blue-200",
            warning: "bg-yellow-500/10 border-yellow-500/20 text-yellow-200",
            danger: "bg-red-500/10 border-red-500/20 text-red-200",
        };

        return (
            <div
                ref={ref}
                className={`flex gap-3 p-4 rounded-lg border ${variantClasses[variant]} ${className}`}
                {...props}
            >
                {icon && <div className="flex-shrink-0">{icon}</div>}
                <div className="text-sm">{children}</div>
            </div>
        );
    }
);
DialogAlert.displayName = "DialogAlert";

// ============================================================================
// EXPORTS
// ============================================================================

export {
    Dialog,
    DialogTrigger,
    DialogClose,
    DialogPortal,
    DialogOverlay,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogBody,
    DialogFooter,
    DialogButton,
    DialogField,
    DialogAlert,
    dialogInputClass,
    dialogSelectClass,
};
