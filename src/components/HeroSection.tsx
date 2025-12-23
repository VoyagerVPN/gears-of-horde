"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
    Heart,
    Sparkles,
    ExternalLink,
    RotateCw,
    Info,
    User,
    HelpCircle,
    Target,
    Globe
} from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";
import RanazyAvatar from "@/images/Ranazy.png";
import Image from "next/image";

interface FAQCardProps {
    title: string;
    children: React.ReactNode;
    icon: React.ReactNode;
    accentColor?: string;
}

function FAQCard({ title, children, icon, accentColor = "primary" }: FAQCardProps) {
    return (
        <div className="bg-surface/80 rounded-lg border border-white/5 p-4 h-full">
            <div className="flex items-center gap-2 mb-2">
                <div className={`text-${accentColor}`}>{icon}</div>
                <h4 className={`text-${accentColor} font-bold text-xs uppercase tracking-wider`}>{title}</h4>
            </div>
            <div className="text-white/70 text-xs leading-relaxed">{children}</div>
        </div>
    );
}

export default function HeroSection() {
    const t = useTranslations("HeroSection");

    return (
        <div className="mb-6">
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
                <Info size={16} className="text-primary" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider font-exo2">{t('info')}</h2>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-12 gap-3">

                {/* Avatar Panel - Bigger */}
                <div className="col-span-12 md:col-span-3 lg:col-span-2 bg-surface/80 rounded-lg border border-white/5 p-4 flex flex-col items-center justify-center">
                    <Image
                        src={RanazyAvatar}
                        alt="Ranazy"
                        width={180}
                        height={180}
                        className="rounded-lg"
                        priority
                    />
                    <p className="mt-3 text-xs text-textMuted italic text-center">{t("avatarCaption")}</p>
                </div>

                {/* Cards 2x3 Grid */}
                <div className="col-span-12 md:col-span-6 lg:col-span-8 grid grid-cols-2 lg:grid-cols-3 gap-3">
                    <FAQCard
                        title={t("whoAmI.title")}
                        icon={<User size={14} />}
                    >
                        {t("whoAmI.content")}
                    </FAQCard>

                    <FAQCard
                        title={t("whatIsGoH.title")}
                        icon={<HelpCircle size={14} />}
                    >
                        {t("whatIsGoH.content")}
                    </FAQCard>

                    <FAQCard
                        title={t("support.title")}
                        icon={<Heart size={14} />}
                        accentColor="red-400"
                    >
                        <p className="mb-1">{t("support.shareText")}</p>
                        <p>
                            {t("support.donateText")}{" "}
                            <a
                                href={SITE_CONFIG.donationUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline inline-flex items-center gap-1"
                            >
                                {t("support.donateLink")}
                                <ExternalLink size={10} />
                            </a>
                        </p>
                    </FAQCard>

                    <FAQCard
                        title={t("whyGoH.title")}
                        icon={<Target size={14} />}
                    >
                        {t("whyGoH.content")}
                    </FAQCard>

                    <FAQCard
                        title={t("whyNotNexus.title")}
                        icon={<Globe size={14} />}
                    >
                        {t("whyNotNexus.content")}
                    </FAQCard>

                    <FAQCard
                        title={t("thanks.title")}
                        icon={<Sparkles size={14} />}
                        accentColor="yellow-400"
                    >
                        <p className="mb-1">
                            {t("thanks.snowbeeIntro")}{" "}
                            <a href={SITE_CONFIG.discord.snowbee} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Discord</a>
                            {" "}{t("thanks.and")}{" "}
                            <a href={SITE_CONFIG.youtube.snowbee} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">YouTube</a>
                        </p>
                        <p>
                            {t("thanks.bromeIntro")}{" "}
                            <a href={SITE_CONFIG.essentialModsUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                Essential Mods
                            </a>
                        </p>
                    </FAQCard>
                </div>

                {/* Mod Wheel Panel - Square */}
                <div className="col-span-12 md:col-span-3 lg:col-span-2 bg-surface/80 rounded-lg border border-white/5 p-4 flex flex-col items-center justify-center">
                    <RotateCw className="w-12 h-12 text-primary mb-3" />
                    <h3 className="font-bold text-white text-xs uppercase tracking-wider text-center font-exo2">
                        {t("spinWheel")}
                    </h3>
                    <p className="text-[10px] text-textMuted text-center mt-1 mb-3">
                        {t("spinWheelDesc")}
                    </p>
                    <button className="w-full bg-primary/10 text-primary text-[10px] font-bold py-2.5 rounded border border-primary/20 hover:bg-primary hover:text-white uppercase tracking-wider">
                        {t("rollRandom")}
                    </button>
                </div>

            </div>
        </div>
    );
}
