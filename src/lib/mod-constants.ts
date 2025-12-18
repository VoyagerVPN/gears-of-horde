import {
    CheckCircle2,
    PauseCircle,
    Ban,
    ArrowUpCircle,
    HelpCircle,
    LucideIcon
} from "lucide-react";
import { ModStatusType } from "@/types/mod";

export interface StatusConfigItem {
    icon: LucideIcon;
    color: string;
    label: string;
}

/**
 * Status configuration for mod status display
 * Used for status icons and dropdown options
 */
export const STATUS_CONFIG: Record<ModStatusType, StatusConfigItem> = {
    active: { icon: CheckCircle2, color: "text-green-500", label: "Active" },
    on_hold: { icon: PauseCircle, color: "text-yellow-500", label: "On Hold" },
    discontinued: { icon: Ban, color: "text-red-500", label: "Discontinued" },
    upcoming: { icon: ArrowUpCircle, color: "text-cyan-400", label: "Upcoming" },
    unknown: { icon: HelpCircle, color: "text-zinc-500", label: "Unknown" }
};

export const STATUS_OPTIONS = Object.entries(STATUS_CONFIG).map(([value, config]) => ({
    value: value as ModStatusType,
    ...config
}));

// ============================================================================
// DEPRECATED - Game version colors are now managed in the database
// ============================================================================
//
// Game versions are stored as tags with category 'gamever' in the database.
// Colors are automatically calculated via recalculateGameVersionColors() in
// tag-actions.ts when versions are added/removed.
//
// The gradient adapts dynamically to the number of existing versions:
// - 2 versions: oldest = red, newest = green
// - 12 versions: smooth gradient from red through yellow to green
//
// To add a new game version:
// 1. Go to Admin > Tags
// 2. Add a new tag with category 'gamever', value like '3_1', displayName 'V3.1'
// 3. Colors will be automatically recalculated
// ============================================================================
