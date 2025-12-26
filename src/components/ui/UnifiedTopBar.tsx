"use client";

import { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "@/i18n/routing";

interface UnifiedTopBarProps {
    title: ReactNode;
    backUrl?: string; // If provided, back button navigates here.
    onBack?: () => void; // If provided, overrides backUrl behavior. If neither, history.back()
    children?: ReactNode; // Right-side actions
    className?: string;
}

export default function UnifiedTopBar({
    title,
    backUrl,
    onBack,
    children,
    className = ""
}: UnifiedTopBarProps) {
    const router = useRouter();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else if (backUrl) {
            router.push(backUrl);
        } else {
            router.back();
        }
    };

    return (
        <div className={`flex items-center justify-between mb-8 sticky top-20 z-40 bg-surface py-4 border-b border-white/10 px-6 ${className}`}>
            <div className="flex items-center gap-4">
                <button
                    onClick={handleBack}
                    className="p-2 hover:bg-white/5 rounded-lg text-textMuted hover:text-white transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>

                <div className="text-xl font-bold text-white font-exo2 leading-none flex items-center gap-2">
                    {title}
                </div>
            </div>

            <div className="flex items-center gap-3">
                {children}
            </div>
        </div>
    );
}
