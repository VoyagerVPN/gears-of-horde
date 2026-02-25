"use client";

import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import TagDivider from "./TagDivider";

interface SplitActionTagProps {
    children: React.ReactNode;
    href: string;
    actionIcon?: React.ReactNode;
    onAction?: (e: React.MouseEvent) => void;
    dynamicStyle?: React.CSSProperties;
    className?: string;
    title?: string;
}

const paddingClasses = "px-2 py-1";

export default function SplitActionTag({
    children,
    href,
    actionIcon,
    onAction,
    dynamicStyle,
    className,
    title
}: SplitActionTagProps) {
    const baseClasses = cn(
        "inline-flex items-center justify-center",
        "transition-colors whitespace-nowrap",
        "text-[13px] font-bold rounded-md",
        "p-0 overflow-hidden border items-stretch leading-none group",
        dynamicStyle ? "" : "border-white/10",
        className
    );

    return (
        <span className={baseClasses} style={dynamicStyle} title={title}>
            <Link
                href={href}
                className={cn(paddingClasses, "hover:bg-white/10 transition-colors h-full flex items-center pl-1.5 pr-1.5 cursor-pointer")}
            >
                {children}
            </Link>
            <TagDivider />
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onAction?.(e);
                }}
                className="pl-1.5 pr-1.5 py-1 hover:bg-white/10 transition-colors h-full flex items-center justify-center"
            >
                {actionIcon}
            </button>
        </span>
    );
}
