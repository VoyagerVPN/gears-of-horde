/**
 * UI Constants
 * Reusable style strings for common UI patterns
 */

export const SECTION_HEADER_STYLE =
    "text-lg font-bold text-white mb-4 border-b border-white/5 pb-2 font-exo2 uppercase tracking-wide flex items-center gap-2";

export const SIDEBAR_HEADER_STYLE =
    "text-xs font-bold text-textMuted uppercase tracking-widest mb-3 font-exo2 flex items-center gap-2";

export const TRANSPARENT_INPUT_BASE =
    "bg-transparent border border-transparent hover:border-white/10 focus:border-white/30 focus:bg-black/20 rounded-md px-1 outline-none transition-all w-full";

export const INVALID_INPUT_STYLE =
    "border-red-500/50 hover:border-red-500 focus:border-red-500 shadow-[0_0_10px_-2px_rgba(239,68,68,0.2)]";

export const CARD_BASE =
    "bg-surface rounded-xl border border-white/5";

export const CARD_HOVER =
    "hover:border-primary/50 transition-all duration-300";

export const CARD_SHADOW =
    "hover:shadow-[0_0_30px_-10px_rgba(206,71,41,0.3)]";

export const CARD_INTERACTIVE =
    `${CARD_BASE} ${CARD_HOVER} ${CARD_SHADOW}`;

export const STANDARD_INPUT_STYLE =
    "bg-black/40 border border-white/10 hover:border-white/20 focus:border-white/30 rounded-md px-3 py-1.5 text-sm text-white placeholder:text-white/20 outline-none transition-all w-full";
