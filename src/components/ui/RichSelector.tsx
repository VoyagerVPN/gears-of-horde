"use client";

import * as Select from "@radix-ui/react-select";
import { ChevronDown, Search, LucideIcon } from "lucide-react";
import { useState, useMemo } from "react";

// ============================================================================
// TYPES
// ============================================================================

export interface RichSelectorOption {
    /** Unique value for the option */
    value: string;
    /** Display label for the option */
    label: string;
    /** Optional icon component */
    icon?: LucideIcon;
    /** Optional icon color - can be hex (#22c55e) or Tailwind class (text-green-400) */
    iconColor?: string;
    /** Whether this is the current/selected option (shows badge) */
    isCurrent?: boolean;
    /** Optional text color - can be hex (#22c55e) or Tailwind class (text-blue-400) */
    labelColor?: string;
}

interface RichSelectorProps {
    /** Current selected value */
    value: string;
    /** Callback when value changes */
    onChange: (value: string) => void;
    /** Array of options to display */
    options: RichSelectorOption[];
    /** Placeholder text when no value selected */
    placeholder?: string;
    /** Label for the "current" badge */
    currentLabel?: string;
    /** Custom trigger className */
    className?: string;
    /** Whether the selector is disabled */
    disabled?: boolean;
    /** Whether to show a search bar in the dropdown */
    searchable?: boolean;
    /** Search placeholder */
    searchPlaceholder?: string;
}

// Helper to check if a color is a hex value
function isHexColor(color?: string): boolean {
    return !!color && color.startsWith('#');
}

// Helper to get style/className props for colored text
function getColorProps(color?: string): { style?: React.CSSProperties; className?: string } {
    if (!color) return {};
    if (isHexColor(color)) {
        return { style: { color } };
    }
    return { className: color };
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function RichSelector({
    value,
    onChange,
    options,
    placeholder = "Select...",
    currentLabel = "Current",
    className = "",
    disabled = false,
    searchable = false,
    searchPlaceholder = "Search...",
}: RichSelectorProps) {
    const [searchQuery, setSearchQuery] = useState("");

    const selectedOption = options.find((o) => o.value === value);
    const selectedIconProps = getColorProps(selectedOption?.iconColor);
    const selectedLabelProps = getColorProps(selectedOption?.labelColor);

    const filteredOptions = useMemo(() => {
        if (!searchQuery.trim()) return options;
        const query = searchQuery.toLowerCase();
        return options.filter(opt =>
            opt.label.toLowerCase().includes(query) ||
            opt.value.toLowerCase().includes(query)
        );
    }, [options, searchQuery]);

    return (
        <Select.Root value={value} onValueChange={onChange} disabled={disabled}>
            <Select.Trigger
                className={`w-full flex items-center justify-between bg-black/20 border border-white/10 hover:border-white/20 focus:border-white/30 rounded-md p-2.5 text-sm text-white outline-none h-[42px] group disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors ${className}`}
            >
                <div className="flex items-center gap-2 truncate">
                    {selectedOption?.icon && (
                        <selectedOption.icon
                            size={16}
                            className={selectedIconProps.className}
                            style={selectedIconProps.style}
                        />
                    )}
                    <span
                        className={`truncate ${!selectedOption ? "text-textMuted/60" : selectedLabelProps.className || ""}`}
                        style={selectedLabelProps.style}
                    >
                        <Select.Value placeholder={placeholder} />
                    </span>
                </div>
                <Select.Icon>
                    <ChevronDown
                        size={16}
                        className="text-textMuted group-hover:text-white opacity-50 transition-colors"
                    />
                </Select.Icon>
            </Select.Trigger>

            <Select.Portal>
                <Select.Content
                    className="overflow-hidden bg-surface border border-white/10 rounded-md shadow-xl z-[150]"
                    position="item-aligned"
                >
                    {searchable && (
                        <div className="p-2 border-b border-white/5 bg-white/5 flex items-center gap-2">
                            <Search size={14} className="text-textMuted" />
                            <input
                                className="bg-transparent border-none outline-none text-xs text-white placeholder:text-textMuted/40 w-full cursor-text"
                                placeholder={searchPlaceholder}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                onKeyDown={(e) => {
                                    if (e.key === ' ') e.stopPropagation(); // Prevent Radix from closing on space
                                }}
                            />
                        </div>
                    )}
                    <Select.Viewport className="p-1 max-h-[280px]">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => {
                                const iconProps = getColorProps(option.iconColor);
                                const labelProps = getColorProps(option.labelColor);

                                return (
                                    <Select.Item
                                        key={option.value}
                                        value={option.value}
                                        className="flex items-center justify-between px-2 py-2 text-sm text-textMuted hover:text-white hover:bg-white/10 rounded-md cursor-pointer outline-none data-[state=checked]:text-white data-[state=checked]:bg-white/5 group"
                                    >
                                        <div className="flex items-center gap-2">
                                            {option.icon && (
                                                <option.icon
                                                    size={16}
                                                    className={iconProps.className}
                                                    style={iconProps.style}
                                                />
                                            )}
                                            <Select.ItemText>
                                                <span
                                                    className={labelProps.className}
                                                    style={labelProps.style}
                                                >
                                                    {option.label}
                                                </span>
                                            </Select.ItemText>
                                        </div>
                                        {option.isCurrent && (
                                            <span className="text-[9px] bg-white/10 text-white/50 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider ml-2">
                                                {currentLabel}
                                            </span>
                                        )}
                                    </Select.Item>
                                );
                            })
                        ) : (
                            <div className="px-2 py-4 text-center text-xs text-textMuted italic">
                                No results found
                            </div>
                        )}
                    </Select.Viewport>
                </Select.Content>
            </Select.Portal>
        </Select.Root>
    );
}

// ============================================================================
// EXPORTS
// ============================================================================

export type { RichSelectorProps };
