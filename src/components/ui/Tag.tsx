import React from "react";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/routing";
import { getTagColor, colorToTagStyles } from "@/lib/tag-colors";
import {
    X,
    CircleUser,
    Gamepad2,
    Settings,
    CheckCircle2,
    PauseCircle,
    Ban,
    ArrowUpCircle,
    HelpCircle,
    BookPlus,
    BookUp,
    BookUp2
} from "lucide-react";

interface TagAction {
    icon: React.ReactNode;
    onClick: (e: React.MouseEvent) => void;
    title?: string;
    variant?: 'default' | 'destructive' | 'confirm' | 'warning' | 'transparent';
}

interface TagProps {
    /** 
     * Tag category for automatic color lookup from tag-colors.ts
     * Takes precedence over variant when combined with value
     */
    category?: string;
    /** Tag value for specific color lookup (e.g., 'active' for status:active) */
    value?: string;
    /** 
     * Predefined styling variant (legacy support)
     * @deprecated Use category/value or color prop instead
     */
    variant?: 'default' | 'category' | 'warning' | 'version' | 'muted' | 'accent' | 'author';
    /** Direct color override (from database) - highest priority */
    color?: string;
    /** Tag content (Left section) */
    children: React.ReactNode;
    /** Additional CSS classes */
    className?: string;
    /** Tooltip text */
    title?: string;
    /** Link destination - makes tag clickable */
    href?: string;
    /** Action callback for split-button tags */
    onAction?: (e: React.MouseEvent) => void;
    /** Icon for the action button (split tags) */
    actionIcon?: React.ReactNode;
    /** Enable custom internal layout (removes default padding/gaps) */
    customLayout?: boolean;
    /** Remove callback - creates a split pill with X button */
    onRemove?: () => void;
    /** List of actions to display (split pill design) - Right section */
    actions?: TagAction[];
    /** Show category-specific icon (author, gamever, etc.) */
    showIcon?: boolean;
    /** Callback for clicking the main content area (e.g. to edit) */
    onContentClick?: (e: React.MouseEvent) => void;

    /** 
     * Middle content section (e.g. for Input fields) 
     * Triggers the multi-section pill layout
     */
    middleContent?: React.ReactNode;
}

function TagDivider() {
    return <div className="w-px self-stretch bg-current opacity-20 shrink-0" />;
}

/**
 * Unified Tag Component
 * 
 * Supports multiple modes:
 * 1. Static Tag - displays text only
 * 2. Link Tag - clickable, navigates to href
 * 3. Split Action Tag - Actions (remove/merge/etc) are split by dividers
 * 4. Multi-section Tag - [Left] | [Middle] | [Right] (e.g. for inline editing)
 * 
 * Color Priority:
 * 1. `color` prop (direct override, typically from DB)
 * 2. `category` + `value` lookup from tag-colors.ts
 * 3. `variant` styles (legacy)
 * 4. Default gray
 */
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
    customLayout,
    onRemove,
    actions = [],
    showIcon = false,
    onContentClick,
    middleContent
}: TagProps) {
    // Legacy variant styles (for backward compatibility)
    const variantStyles = {
        default: "bg-white/5 text-white",
        category: "bg-green-500/10 text-green-400",
        warning: "bg-red-500/10 text-red-400",
        version: "font-bold tracking-wide",
        muted: "bg-white/5 text-textMuted opacity-60",
        accent: "bg-primary/10 text-primary",
        author: "bg-cyan-400/15 text-cyan-300",
    };

    // Determine the final color to use
    // Priority: direct color > category lookup > variant default
    let dynamicStyle: React.CSSProperties | undefined;

    if (color) {
        // Direct color override (from DB)
        dynamicStyle = colorToTagStyles(color, category);
    } else if (category) {
        // Category-based lookup
        const categoryColor = getTagColor(category, value);
        dynamicStyle = colorToTagStyles(categoryColor, category);
    }

    // Add border color if dynamic style exists (defaults to ~20% opacity of key color)
    // ONLY if not already defined (like for lang tags)
    if (dynamicStyle && dynamicStyle.color && !dynamicStyle.borderColor) {
        dynamicStyle.borderColor = `${dynamicStyle.color}33`;
    }

    // Get category icon
    const getCategoryIcon = () => {
        switch (category) {
            case 'author': return <CircleUser size={14} />;
            case 'gamever': return <Gamepad2 size={14} />;
            case 'modver': return <Settings size={14} />;
            case 'status': {
                switch (value) {
                    case 'active': return <CheckCircle2 size={14} />;
                    case 'on_hold': return <PauseCircle size={14} />;
                    case 'discontinued': return <Ban size={14} />;
                    case 'upcoming': return <ArrowUpCircle size={14} />;
                    case 'unknown': return <HelpCircle size={14} />;
                    default: return <HelpCircle size={14} />;
                }
            }
            case 'newscat': {
                switch (value) {
                    case 'new': return <BookPlus size={14} />;
                    case 'status': return <BookPlus size={14} />;
                    case 'release': return <BookUp2 size={14} />;
                    case 'update': return <BookUp size={14} />;
                    default: return <BookPlus size={14} />;
                }
            }
            default: return null;
        }
    };

    // Combine onRemove and legacy onAction into generic actions array
    const allActions = [...actions];

    // Legacy onAction support (if href and onAction are both present)
    if (href && onAction && !actionIcon) {
        // This is handled visually below in the "legacy split" block, 
        // but if we move to unified actions, we might need to adapt.
        // For now, we'll keep the legacy block for specifically href+onAction.
    } else if (onAction && actionIcon) {
        // If it's just a generic action button (like "external link" button in localizations)
        allActions.push({
            icon: actionIcon,
            onClick: (e) => { e.preventDefault(); e.stopPropagation(); onAction(e); },
            variant: 'default', // or whatever
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

    // Base classes - unified styling
    const baseClasses = cn(
        "inline-flex items-center justify-center",
        "transition-colors whitespace-nowrap",
        "text-[13px] font-bold rounded-md", // Rounded-md per user request roughly matching the screenshot (or change to rounded-full if needed)
        // "capitalize", // Removed to respect author name casing
        "cursor-default", // Default cursor, overridden for links
        // Apply variant styles ONLY if no dynamic color
        !dynamicStyle && variantStyles[variant],
        className
    );

    const paddingClasses = "px-2 py-1";
    const icon = showIcon ? getCategoryIcon() : null;


    // Helper to render action buttons
    const renderActionButtons = () => (
        allActions.map((action, idx) => (
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
        ))
    );

    // --- COMPLEX LAYOUTS ---

    // 1. Multi-section Layout (Left | Middle | Right)
    // Triggered by presence of middleContent, or if we have actions but no special href requirement
    if (middleContent || (allActions.length > 0 && !href)) {
        return (
            <span
                className={cn(baseClasses, "p-0 overflow-hidden border items-stretch leading-none group", dynamicStyle ? "" : "border-white/10")}
                style={dynamicStyle}
                title={title}
            >
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
                {renderActionButtons()}
            </span>
        );
    }

    // 2. Legacy Split Action Tag (Href + Action)
    // Specifically for "External Link" tags that are clickable BUT also have a secondary action (like delete or open external)
    if (href && onAction && !middleContent) {
        return (
            <span
                className={cn(baseClasses, "p-0 overflow-hidden border items-stretch leading-none group", dynamicStyle ? "" : "border-white/10")}
                style={dynamicStyle}
                title={title}
            >
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
                        onAction(e);
                    }}
                    className="pl-1.5 pr-1.5 py-1 hover:bg-white/10 transition-colors h-full flex items-center justify-center"
                >
                    {actionIcon}
                </button>
            </span>
        );
    }

    // 3. Link Tag (Simple)
    if (href) {
        return (
            <span
                className={cn(baseClasses, "p-0 overflow-hidden border border-transparent")}
                style={dynamicStyle}
                title={title}
            >
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

    // 4. Static Tag (Default or Custom Layout)
    return (
        <span
            className={cn(baseClasses, customLayout ? "p-0 overflow-hidden" : cn(paddingClasses, "gap-1.5 border border-transparent"))}
            style={dynamicStyle}
            title={title}
        >
            {icon}
            {children}
        </span>
    );
}
