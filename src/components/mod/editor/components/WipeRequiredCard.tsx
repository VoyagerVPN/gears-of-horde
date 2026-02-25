"use client";

import { AlertTriangle, Check } from "lucide-react";
import { useTranslations } from "next-intl";

interface WipeRequiredCardProps {
    value: boolean;
    onChange: (value: boolean) => void;
}

export default function WipeRequiredCard({ value, onChange }: WipeRequiredCardProps) {
    const t = useTranslations('UnifiedUpdateModal');

    return (
        <div
            onClick={() => onChange(!value)}
            className={`group relative overflow-hidden rounded-xl border p-4 cursor-pointer transition-all duration-300 ${value
                    ? "bg-red-500/10 border-red-500/30 ring-1 ring-red-500/20 shadow-lg"
                    : "bg-black/20 border-white/5 hover:border-white/10"
                }`}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg transition-colors ${value ? "bg-red-500 text-white" : "bg-white/5 text-textMuted"}`}>
                        <AlertTriangle size={20} />
                    </div>
                    <div>
                        <h4 className={`text-sm font-bold uppercase tracking-wider ${value ? "text-red-400" : "text-white"}`}>
                            {t("wipeRequired")}
                        </h4>
                        <p className="text-[10px] text-textMuted">Save-breaking update: Users must start over</p>
                    </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${value ? "border-red-500 bg-red-500" : "border-white/10 group-hover:border-white/30"}`}>
                    {value && <Check size={12} className="text-white" />}
                </div>
            </div>
        </div>
    );
}
