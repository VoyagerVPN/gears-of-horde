"use client";

import {
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

export function getCategoryIcon(category?: string, value?: string) {
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
}
