"use client";

import { useTranslations } from "next-intl";
import { Info, ChevronDown, ChevronRight } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/Tooltip";
import RanazyAvatar from "@/images/Ranazy.png";
import Image from "next/image";
import { useState } from "react";

export default function HeroSection() {
    const t = useTranslations("HeroSection");
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="mb-6">
            {/* Header */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 mb-3 cursor-pointer hover:opacity-80 transition-opacity"
            >
                <Info size={24} className="text-primary" />
                <h2 className="text-2xl font-bold text-white uppercase tracking-wider font-exo2">{t('info')}</h2>
                {isOpen ? <ChevronDown className="text-white/50" /> : <ChevronRight className="text-white/50" />}
            </button>

            {/* Compact Bento Grid - 2 panels side by side */}
            {isOpen && (
                <TooltipProvider>
                    <div className="grid grid-cols-12 gap-3 animate-in fade-in slide-in-from-top-2 duration-200">

                        {/* Avatar Panel */}
                        <div className="col-span-9 md:col-span-5 lg:col-span-3 aspect-square bg-surface/80 rounded-lg border border-white/5 p-4 flex flex-col items-center justify-center relative overflow-hidden">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Image
                                        src={RanazyAvatar}
                                        alt="Ranazy"
                                        width={180}
                                        height={180}
                                        className="rounded-lg cursor-help transition-transform hover:scale-105"
                                        priority
                                    />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{t("avatarCaption")}</p>
                                </TooltipContent>
                            </Tooltip>

                            <div className="mt-4 text-center overflow-y-auto max-h-[40%] custom-scrollbar">
                                <h3 className="font-bold text-white text-xs uppercase tracking-wider mb-2">{t("whoAmI.title")}</h3>
                                <p className="text-[11px] text-textMuted leading-relaxed text-balance px-2">
                                    {t("whoAmI.content")}
                                </p>
                            </div>
                        </div>

                        {/* Mod Wheel Panel - Embedded iframe */}
                        <div className="col-span-9 md:col-span-5 lg:col-span-3 aspect-square bg-surface rounded-lg border border-white/5 overflow-hidden">
                            <iframe
                                src="https://wheelofnames.com/g39-rf4"
                                className="w-full h-full border-0"
                                title={t("spinWheel")}
                            />
                        </div>

                    </div>
                </TooltipProvider>
            )}
        </div>
    );
}
