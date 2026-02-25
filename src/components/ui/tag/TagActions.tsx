"use client";

import React from "react";
import { cn } from "@/lib/utils";
import TagDivider from "./TagDivider";

export interface TagAction {
    icon: React.ReactNode;
    onClick: (e: React.MouseEvent) => void;
    title?: string;
    variant?: 'default' | 'destructive' | 'confirm' | 'warning' | 'transparent';
}

interface TagActionsProps {
    actions: TagAction[];
}

export default function TagActions({ actions }: TagActionsProps) {
    if (actions.length === 0) return null;

    return (
        <>
            {actions.map((action, idx) => (
                <React.Fragment key={idx}>
                    <TagDivider />
                    <button
                        type="button"
                        onClick={action.onClick}
                        className={cn(
                            "px-1.5 py-1.5 transition-colors self-stretch flex items-center justify-center min-w-[28px]",
                            action.variant === 'destructive' ? "hover:bg-red-500/20 hover:text-red-400" :
                                action.variant === 'confirm' ? "hover:bg-green-500/20 hover:text-green-400" :
                                    action.variant === 'warning' ? "hover:bg-yellow-500/20 hover:text-yellow-400" :
                                        action.variant === 'transparent' ? "hover:bg-transparent cursor-default" :
                                            "hover:bg-white/10"
                        )}
                        title={action.title}
                    >
                        {action.icon}
                    </button>
                </React.Fragment>
            ))}
        </>
    );
}
