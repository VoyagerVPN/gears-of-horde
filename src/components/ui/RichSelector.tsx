"use client";

import * as Select from "@radix-ui/react-select";
import { ChevronDown, LucideIcon } from "lucide-react";

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
    /** Optional icon color class (e.g., "text-green-500") */
    iconColor?: string;
    /** Whether this is the current/selected option (shows badge) */
    isCurrent?: boolean;
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
}: RichSelectorProps) {
    const selectedOption = options.find((o) => o.value === value);

    return (
        <Select.Root value={value} onValueChange={onChange} disabled={disabled}>
            <Select.Trigger
                className={`w-full flex items-center justify-between bg-black/20 border border-white/10 hover:border-white/20 focus:border-white/30 rounded-lg p-2.5 text-sm text-white outline-none h-[42px] group disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
            >
                <div className="flex items-center gap-2 truncate">
                    {selectedOption?.icon && (
                        <selectedOption.icon size={16} className={selectedOption.iconColor} />
                    )}
                    <span className={`truncate ${!selectedOption ? "text-textMuted/60" : ""}`}>
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
                    className="overflow-hidden bg-surface border border-white/10 rounded-lg shadow-xl z-[150]"
                    position="item-aligned"
                >
                    <Select.Viewport className="p-1 max-h-[280px]">
                        {options.map((option) => (
                            <Select.Item
                                key={option.value}
                                value={option.value}
                                className="flex items-center justify-between px-2 py-2 text-sm text-textMuted hover:text-white hover:bg-white/10 rounded cursor-pointer outline-none data-[state=checked]:text-white data-[state=checked]:bg-white/5 group"
                            >
                                <div className="flex items-center gap-2">
                                    {option.icon && (
                                        <option.icon size={16} className={option.iconColor} />
                                    )}
                                    <Select.ItemText>
                                        <span>{option.label}</span>
                                    </Select.ItemText>
                                </div>
                                {option.isCurrent && (
                                    <span className="text-[9px] bg-white/10 text-white/50 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider ml-2">
                                        {currentLabel}
                                    </span>
                                )}
                            </Select.Item>
                        ))}
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
