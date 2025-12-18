/**
 * UI Constants
 * Reusable style strings for common UI patterns
 */

export const SECTION_HEADER_STYLE =
    "text-lg font-bold text-white mb-4 border-b border-white/5 pb-2 font-exo2 uppercase tracking-wide flex items-center gap-2";

export const SIDEBAR_HEADER_STYLE =
    "text-xs font-bold text-textMuted uppercase tracking-widest mb-3 font-exo2 flex items-center gap-2";

export const TRANSPARENT_INPUT_BASE =
    "bg-transparent border border-transparent hover:border-white/10 focus:border-primary/50 focus:bg-black/20 rounded px-1 outline-none transition-all w-full";

export const CARD_BASE =
    "bg-surface rounded-xl border border-white/5";

export const CARD_HOVER =
    "hover:border-primary/50 transition-all duration-300";

export const CARD_SHADOW =
    "hover:shadow-[0_0_30px_-10px_rgba(206,71,41,0.3)]";

export const CARD_INTERACTIVE =
    `${CARD_BASE} ${CARD_HOVER} ${CARD_SHADOW}`;
