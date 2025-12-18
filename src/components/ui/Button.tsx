import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    icon?: LucideIcon;
    children: React.ReactNode;
    className?: string;
}

/**
 * Unified Button Component
 * Standardized button with multiple variants and sizes
 */
export default function Button({
    variant = 'primary',
    size = 'md',
    icon: Icon,
    children,
    className,
    ...props
}: ButtonProps) {

    const baseStyles = "font-bold rounded-lg transition-all active:scale-95 uppercase tracking-wider font-exo2 flex items-center justify-center gap-2";

    const variantStyles = {
        primary: "bg-primary hover:bg-red-600 text-white shadow-lg",
        secondary: "bg-white/10 hover:bg-white/20 text-white border border-white/10",
        ghost: "text-textMuted hover:text-white hover:bg-white/5",
        danger: "bg-red-500 hover:bg-red-600 text-white shadow-lg",
    };

    const sizeStyles = {
        sm: "px-3 py-1.5 text-[10px]",
        md: "px-4 py-2 text-xs",
        lg: "px-6 py-3 text-sm",
    };

    return (
        <button
            className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
            {...props}
        >
            {Icon && <Icon size={size === 'lg' ? 20 : size === 'md' ? 16 : 14} />}
            {children}
        </button>
    );
}
