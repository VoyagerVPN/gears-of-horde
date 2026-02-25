"use client";

import React from "react";
import { getTagColor, colorToTagStyles } from "@/lib/tag-colors";
import { X } from "lucide-react";

import { getCategoryIcon } from "./tag/icons";
import MultiSectionTag from "./tag/MultiSectionTag";
import LinkTag from "./tag/LinkTag";
import SplitActionTag from "./tag/SplitActionTag";
import StaticTag from "./tag/StaticTag";
import { TagAction } from "./tag/TagActions";

export interface TagProps {
    category?: string;
    value?: string;
    variant?: 'default' | 'category' | 'warning' | 'version' | 'muted' | 'accent' | 'author';
    color?: string;
    children: React.ReactNode;
    className?: string;
    title?: string;
    href?: string;
    onAction?: (e: React.MouseEvent) => void;
    actionIcon?: React.ReactNode;
    onRemove?: () => void;
    actions?: TagAction[];
    showIcon?: boolean;
    onContentClick?: (e: React.MouseEvent) => void;
    middleContent?: React.ReactNode;
}

export default function Tag({
    category,
    value,
    variant = 'default',
    children,
    className,
    title,
    color,
    href,
    onAction,
    actionIcon,
    onRemove,
    actions = [],
    showIcon = false,
    onContentClick,
    middleContent
}: TagProps) {
    // Legacy variant styles (for backward compatibility)
    const variantStyles: Record<string, string> = {
        default: "bg-white/5 text-white",
        category: "bg-green-500/10 text-green-400",
        warning: "bg-red-500/10 text-red-400",
        version: "font-bold tracking-wide",
        muted: "bg-white/5 text-textMuted opacity-60",
        accent: "bg-primary/10 text-primary",
        author: "bg-cyan-400/15 text-cyan-300",
    };

    // Determine the final color to use
    let dynamicStyle: React.CSSProperties | undefined;
    if (color) {
        dynamicStyle = colorToTagStyles(color, category);
    } else if (category) {
        const categoryColor = getTagColor(category, value);
        dynamicStyle = colorToTagStyles(categoryColor, category);
    }

    // Add border color if dynamic style exists
    if (dynamicStyle?.color && !dynamicStyle.borderColor) {
        dynamicStyle.borderColor = `${dynamicStyle.color}33`;
    }

    const icon = showIcon ? getCategoryIcon(category, value) : null;

    // Combine onRemove into actions array
    const allActions: TagAction[] = [...actions];
    if (onAction && actionIcon) {
        allActions.push({
            icon: actionIcon,
            onClick: (e) => { e.preventDefault(); e.stopPropagation(); onAction(e); },
            variant: 'default',
            title: 'Action'
        });
    }
    if (onRemove) {
        allActions.push({
            icon: <X size={14} />,
            onClick: (e) => { e.preventDefault(); e.stopPropagation(); onRemove(); },
            variant: 'destructive',
            title: 'Remove'
        });
    }

    // 1. Multi-section Layout (Left | Middle | Right)
    if (middleContent || (allActions.length > 0 && !href)) {
        return (
            <MultiSectionTag
                icon={icon}
                dynamicStyle={dynamicStyle}
                className={className}
                title={title}
                middleContent={middleContent}
                actions={allActions}
                onContentClick={onContentClick}
            >
                {children}
            </MultiSectionTag>
        );
    }

    // 2. Legacy Split Action Tag (Href + Action)
    if (href && onAction && !middleContent) {
        return (
            <SplitActionTag
                href={href}
                actionIcon={actionIcon}
                onAction={onAction}
                dynamicStyle={dynamicStyle}
                className={className}
                title={title}
            >
                {children}
            </SplitActionTag>
        );
    }

    // 3. Link Tag
    if (href) {
        return (
            <LinkTag
                href={href}
                icon={icon}
                dynamicStyle={dynamicStyle}
                className={className}
                title={title}
            >
                {children}
            </LinkTag>
        );
    }

    // 4. Static Tag
    return (
        <StaticTag
            icon={icon}
            dynamicStyle={dynamicStyle}
            variantStyle={variantStyles[variant]}
            className={className}
            title={title}
        >
            {children}
        </StaticTag>
    );
}

// Re-export types for convenience
export type { TagAction };
