"use client";

import React from "react";
import { cn } from "@/lib/utils";
import TagDivider from "./TagDivider";
import TagActions, { TagAction } from "./TagActions";

interface MultiSectionTagProps {
    children: React.ReactNode;
    icon?: React.ReactNode;
    dynamicStyle?: React.CSSProperties;
    className?: string;
    title?: string;
    middleContent?: React.ReactNode;
    actions: TagAction[];
    onContentClick?: (e: React.MouseEvent) => void;
}

const paddingClasses = "px-2 py-1";

export default function MultiSectionTag({
    children,
    icon,
    dynamicStyle,
    className,
    title,
    middleContent,
    actions,
    onContentClick
}: MultiSectionTagProps) {
    const baseClasses = cn(
        "inline-flex items-center justify-center",
        "transition-colors whitespace-nowrap",
        "text-[13px] font-bold rounded-md",
        "cursor-default",
        "p-0 overflow-hidden border items-stretch leading-none group",
        dynamicStyle ? "" : "border-white/10",
        className
    );

    return (
        <span className={baseClasses} style={dynamicStyle} title={title}>
            {/* LEFT SECTION */}
            {onContentClick ? (
                <button
                    type="button"
                    onClick={onContentClick}
                    className={cn(paddingClasses, "flex items-center gap-1.5 self-stretch hover:bg-white/10 transition-colors text-left")}
                >
                    {icon}
                    <span className="leading-none">{children}</span>
                </button>
            ) : (
                <span className={cn(paddingClasses, "flex items-center gap-1.5 self-stretch")}>
                    {icon}
                    <span className="leading-none">{children}</span>
                </span>
            )}

            {/* MIDDLE SECTION */}
            {middleContent && (
                <>
                    <TagDivider />
                    <div className="flex-1 self-stretch flex items-center px-2 py-1.5 transition-colors hover:bg-white/10">
                        {middleContent}
                    </div>
                </>
            )}

            {/* RIGHT SECTION (Actions) */}
            <TagActions actions={actions} />
        </span>
    );
}
