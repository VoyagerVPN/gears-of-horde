import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
    icon?: LucideIcon;
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'sidebar';
}

/**
 * Unified Section Header Component
 * Provides consistent header styling across sections
 */
export default function SectionHeader({
    icon: Icon,
    children,
    className,
    variant = 'default'
}: SectionHeaderProps) {

    const styles = {
        default: "text-lg font-bold text-white mb-4 border-b border-white/5 pb-2 font-exo2 uppercase tracking-wide flex items-center gap-2",
        sidebar: "text-xs font-bold text-textMuted uppercase tracking-widest mb-3 font-exo2 flex items-center gap-2",
    };

    return (
        <h3 className={cn(styles[variant], className)}>
            {Icon && <Icon size={variant === 'default' ? 20 : 16} className="text-primary" />}
            {children}
        </h3>
    );
}
