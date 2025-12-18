import { cn } from "@/lib/utils";
import { Link } from "@/i18n/routing";
import { getTagColor, colorToTagStyles, TAG_STYLES } from "@/lib/tag-colors";

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
    /** Tag content */
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
}

/**
 * Unified Tag Component
 * 
 * Supports multiple modes:
 * 1. Static Tag - displays text only
 * 2. Link Tag - clickable, navigates to href
 * 3. Split Action Tag - link part + action button (for localizations with download)
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
    actionIcon
}: TagProps) {
    // Legacy variant styles (for backward compatibility)
    const variantStyles = {
        default: "bg-white/5 text-textMain border-white/10",
        category: "bg-green-500/10 text-green-400 border-green-500/20",
        warning: "bg-red-500/10 text-red-400 border-red-500/20 font-bold",
        version: "font-mono font-bold tracking-wide",
        muted: "bg-white/5 text-textMuted border-white/5 opacity-60",
        accent: "bg-primary/10 text-primary border-primary/20",
        author: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    };

    // Determine the final color to use
    // Priority: direct color > category lookup > variant default
    let dynamicStyle: React.CSSProperties | undefined;

    if (color) {
        // Direct color override (from DB)
        dynamicStyle = colorToTagStyles(color);
    } else if (category) {
        // Category-based lookup
        const categoryColor = getTagColor(category, value);
        dynamicStyle = colorToTagStyles(categoryColor);
    }
    // If neither, variantStyles will be applied via className

    // Base classes - hardcoded for reliability
    const baseClasses = cn(
        // Core styling - unified across all tags
        "inline-flex items-center justify-center gap-1",
        "border transition-colors whitespace-nowrap",
        // Hardcoded sizing for reliability
        "text-[9px] font-medium rounded",
        "capitalize", // Title case, not uppercase
        // Apply variant styles only if no dynamic color
        !dynamicStyle && variantStyles[variant],
        className
    );

    // Padding classes - hardcoded
    const paddingClasses = "px-1.5 py-0.5";

    // 1. Split Action Tag (Link + Button)
    if (href && onAction) {
        return (
            <span
                className={cn(baseClasses, "p-0 overflow-hidden group")}
                style={dynamicStyle}
                title={title}
            >
                <Link
                    href={href}
                    className={cn(paddingClasses, "hover:bg-white/10 transition-colors h-full flex items-center")}
                >
                    {children}
                </Link>
                <div className="w-px self-stretch bg-current opacity-20" />
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onAction(e);
                    }}
                    className="px-1.5 py-0.5 hover:bg-white/10 transition-colors h-full flex items-center justify-center"
                >
                    {actionIcon}
                </button>
            </span>
        );
    }

    // 2. Link Tag
    if (href) {
        return (
            <Link
                href={href}
                className={cn(baseClasses, paddingClasses, "hover:opacity-80 active:scale-95")}
                style={dynamicStyle}
                title={title}
            >
                {children}
            </Link>
        );
    }

    // 3. Static Tag (Default)
    return (
        <span
            className={cn(baseClasses, paddingClasses)}
            style={dynamicStyle}
            title={title}
        >
            {children}
        </span>
    );
}
