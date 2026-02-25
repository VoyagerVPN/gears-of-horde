"use client";

import { useTranslations } from "next-intl";
import {
    Heart,
    Sparkles,
    ExternalLink,
    HelpCircle,
    Target,
    Globe
} from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";

interface FAQCardProps {
    title: string;
    children: React.ReactNode;
    icon: React.ReactNode;
    accentColor?: string;
}

function FAQCard({ title, children, icon, accentColor = "primary" }: FAQCardProps) {
    return (
        <div className="bg-surface/80 rounded-lg border border-white/5 p-6 h-full">
            <div className="flex items-center gap-2 mb-3">
                <div className={`text-${accentColor}`}>{icon}</div>
                <h3 className={`text-${accentColor} font-bold text-sm uppercase tracking-wider`}>{title}</h3>
            </div>
            <div className="text-white/70 text-sm leading-relaxed">{children}</div>
        </div>
    );
}

export default function FAQPage() {
    const t = useTranslations("HeroSection");

    return (
        <div className="w-[95%] max-w-[1800px] mx-auto py-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <HelpCircle size={24} className="text-primary" />
                <h1 className="text-2xl font-bold text-white uppercase tracking-wider font-exo2">FAQ</h1>
            </div>

            {/* FAQ Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">


                <FAQCard
                    title={t("whatIsGoH.title")}
                    icon={<HelpCircle size={18} />}
                >
                    {t("whatIsGoH.content")}
                </FAQCard>

                <FAQCard
                    title={t("support.title")}
                    icon={<Heart size={18} />}
                    accentColor="red-400"
                >
                    <p className="mb-2">{t("support.shareText")}</p>
                    <p>
                        {t("support.donateText")}{" "}
                        <a
                            href={SITE_CONFIG.donationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline inline-flex items-center gap-1"
                        >
                            {t("support.donateLink")}
                            <ExternalLink size={12} />
                        </a>
                    </p>
                </FAQCard>

                <FAQCard
                    title={t("whyGoH.title")}
                    icon={<Target size={18} />}
                >
                    {t("whyGoH.content")}
                </FAQCard>

                <FAQCard
                    title={t("whyNotNexus.title")}
                    icon={<Globe size={18} />}
                >
                    {t("whyNotNexus.content")}
                </FAQCard>

                <FAQCard
                    title={t("thanks.title")}
                    icon={<Sparkles size={18} />}
                    accentColor="yellow-400"
                >
                    <p className="mb-2">
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
        </div>
    );
}
