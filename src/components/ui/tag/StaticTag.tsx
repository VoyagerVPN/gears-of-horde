"use client";

import { cn } from "@/lib/utils";

interface StaticTagProps {
    children: React.ReactNode;
    icon?: React.ReactNode;
    dynamicStyle?: React.CSSProperties;
    variantStyle?: string;
    className?: string;
    title?: string;
}

const paddingClasses = "px-2 py-1";

export default function StaticTag({
    children,
    icon,
    dynamicStyle,
    variantStyle,
    className,
    title
}: StaticTagProps) {
    const baseClasses = cn(
        "inline-flex items-center justify-center",
        "transition-colors whitespace-nowrap",
        "text-[13px] font-bold rounded-md",
        "cursor-default",
        dynamicStyle ? "" : variantStyle,
        className
    );

    return (
        <span
            className={cn(baseClasses, "gap-1.5 border border-transparent", paddingClasses)}
            style={dynamicStyle}
            title={title}
        >
            {icon}
            {children}
        </span>
    );
}
