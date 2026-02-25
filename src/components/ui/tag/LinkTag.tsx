"use client";

import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";

interface LinkTagProps {
    children: React.ReactNode;
    icon?: React.ReactNode;
    href: string;
    dynamicStyle?: React.CSSProperties;
    className?: string;
    title?: string;
}

const paddingClasses = "px-2 py-1";

export default function LinkTag({
    children,
    icon,
    href,
    dynamicStyle,
    className,
    title
}: LinkTagProps) {
    const baseClasses = cn(
        "inline-flex items-center justify-center",
        "transition-colors whitespace-nowrap",
        "text-[13px] font-bold rounded-md",
        "p-0 overflow-hidden border border-transparent",
        className
    );

    return (
        <span className={baseClasses} style={dynamicStyle} title={title}>
            <Link
                href={href}
                className={cn(paddingClasses, "gap-1.5 hover:bg-white/10 transition-colors h-full w-full flex items-center justify-center cursor-pointer")}
            >
                {icon}
                {children}
            </Link>
        </span>
    );
}
