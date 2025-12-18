import { Gamepad2, Settings } from "lucide-react";
import Tag from "@/components/ui/Tag";

interface VersionTagProps {
    type: 'game' | 'mod';
    version: string;
    className?: string;
    /** Database color for game versions (required for gamever, optional for mod) */
    color?: string;
}

/**
 * Version Tag Component
 * 
 * Displays game version or mod version with appropriate styling:
 * - Game versions: Gamepad icon + dynamic gradient color from DB
 * - Mod versions: Settings icon + neutral gray styling
 * 
 * @note Game versions MUST have colors from database (calculated via recalculateGameVersionColors)
 */
export default function VersionTag({ type, version, className, color }: VersionTagProps) {
    if (!version) return null;

    const isGame = type === 'game';
    const Icon = isGame ? Gamepad2 : Settings;

    // Game versions use DB color via Tag's dynamic color prop
    // Mod versions use neutral styling via category
    return (
        <Tag
            category={isGame ? 'gamever' : undefined}
            color={color}
            className={`${className || ''} font-mono font-bold tracking-wide gap-1.5`}
        >
            <Icon size={12} className={isGame ? undefined : "text-zinc-400"} />
            {version}
        </Tag>
    );
}
