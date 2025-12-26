"use client";

import { useTranslations } from "next-intl";
import { RotateCw, Info } from "lucide-react";
import RanazyAvatar from "@/images/Ranazy.png";
import Image from "next/image";

export default function HeroSection() {
    const t = useTranslations("HeroSection");

    return (
        <div className="mb-6">
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
                <Info size={16} className="text-primary" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider font-exo2">{t('info')}</h2>
            </div>

            {/* Compact Bento Grid - 2 panels side by side */}
            <div className="grid grid-cols-12 gap-3">

                {/* Avatar Panel */}
                <div className="col-span-6 md:col-span-3 lg:col-span-2 bg-surface/80 rounded-lg border border-white/5 p-4 flex flex-col items-center justify-center">
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

                {/* Mod Wheel Panel */}
                <div className="col-span-6 md:col-span-3 lg:col-span-2 bg-surface/80 rounded-lg border border-white/5 p-4 flex flex-col items-center justify-center">
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
