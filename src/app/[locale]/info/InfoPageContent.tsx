"use client";

import { useTranslations } from "next-intl";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/Tooltip";
import RanazyAvatar from "@/images/Ranazy.png";
import Image from "next/image";

function AboutBlock({ titleKey, contentKey }: { titleKey: string; contentKey: string }) {
    const t = useTranslations("HeroSection");
    return (
        <div className="bg-surface/80 rounded-lg border border-white/5 p-4">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider mb-2">{t(titleKey)}</h3>
            <p className="text-[11px] text-textMuted leading-relaxed">{t(contentKey)}</p>
        </div>
    );
}

export default function InfoPageContent() {
    const t = useTranslations("HeroSection");

    return (
        <TooltipProvider>
            {/* Page title */}
            <h1 className="text-2xl font-bold text-white uppercase tracking-wider font-exo2 mb-6">
                {t("info")}
            </h1>

            {/* Top row: Avatar + Who am I | Wheel */}
            <div className="grid grid-cols-12 gap-3 mb-6">
                {/* Avatar Panel */}
                <div className="col-span-12 md:col-span-5 lg:col-span-3 aspect-square bg-surface/80 rounded-lg border border-white/5 p-4 flex flex-col items-center justify-center relative overflow-hidden">
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
                        <h2 className="font-bold text-white text-xs uppercase tracking-wider mb-2">{t("whoAmI.title")}</h2>
                        <p className="text-[11px] text-textMuted leading-relaxed text-balance px-2">
                            {t("whoAmI.content")}
                        </p>
                    </div>
                </div>

                {/* Wheel Panel */}
                <div className="col-span-12 md:col-span-5 lg:col-span-3 aspect-square bg-surface rounded-lg border border-white/5 overflow-hidden">
                    <iframe
                        src="https://wheelofnames.com/g39-rf4"
                        className="w-full h-full border-0"
                        title={t("spinWheel")}
                    />
                </div>
            </div>

            {/* About blocks */}
            <div className="space-y-3">
                <AboutBlock titleKey="whatIsGoH.title" contentKey="whatIsGoH.content" />
                <AboutBlock titleKey="whyGoH.title" contentKey="whyGoH.content" />
                <AboutBlock titleKey="whyNotNexus.title" contentKey="whyNotNexus.content" />
                <div className="bg-surface/80 rounded-lg border border-white/5 p-4">
                    <h3 className="font-bold text-white text-xs uppercase tracking-wider mb-2">{t("support.title")}</h3>
                    <p className="text-[11px] text-textMuted leading-relaxed">
                        {t("support.shareText")} {t("support.donateText")}
                        <a href="https://boosty.to/ranazy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">{t("support.donateLink")}</a>
                    </p>
                </div>
                <div className="bg-surface/80 rounded-lg border border-white/5 p-4">
                    <h3 className="font-bold text-white text-xs uppercase tracking-wider mb-2">{t("thanks.title")}</h3>
                    <p className="text-[11px] text-textMuted leading-relaxed">
                        {t("thanks.snowbeeIntro")}
                        <a href="https://www.youtube.com/@SnowBeeGaming" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline"> YouTube</a>
                        {t("thanks.and")}
                        <a href="https://www.youtube.com/@SnowBeeGaming" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline"> Twitch</a>
                        {t("thanks.snowbeeOutro")}
                        {t("thanks.bromeIntro")}
                        <a href="https://brome.dev" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline"> Brome</a>
                        {t("thanks.bromeOutro")}
                    </p>
                </div>
            </div>
        </TooltipProvider>
    );
}
