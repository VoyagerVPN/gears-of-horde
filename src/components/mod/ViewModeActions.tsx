"use client";

import { useState, useEffect } from "react";
import { Download, Heart } from "lucide-react";
import { Disc as Discord } from "lucide-react";
import { toggleSubscription, getSubscriptionStatus, recordDownload, recordView } from "@/app/actions/profile-actions";
import type { ModData } from "@/schemas";

interface ViewModeActionsProps {
    mod: ModData;
    t: (key: string) => string;
}

/**
 * View mode action buttons: Download, Discord, and Subscribe
 * Handles download tracking and subscription state
 */
export default function ViewModeActions({ mod, t }: ViewModeActionsProps) {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Check subscription status on mount
        getSubscriptionStatus(mod.slug).then(({ subscribed }) => {
            setIsSubscribed(subscribed);
        });

        // Record view when component mounts
        recordView(mod.slug);
    }, [mod.slug]);

    const handleSubscribe = async () => {
        setIsLoading(true);
        const { subscribed } = await toggleSubscription(mod.slug);
        setIsSubscribed(subscribed);
        setIsLoading(false);
    };

    const handleDownload = async () => {
        // Generate session ID (stored in sessionStorage)
        let sessionId = sessionStorage.getItem('download_session');
        if (!sessionId) {
            sessionId = crypto.randomUUID();
            sessionStorage.setItem('download_session', sessionId);
        }

        // Record download
        await recordDownload(mod.slug, mod.version, sessionId);

        // Open download link
        if (mod.links.download) {
            window.open(mod.links.download, '_blank');
        }
    };

    return (
        <div className="flex gap-3 h-14">
            <button
                onClick={handleDownload}
                className="flex-1 bg-primary hover:bg-red-600 text-white font-bold h-full rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 uppercase tracking-wider font-exo2 group"
            >
                <Download size={20} className="group-hover:animate-bounce" />
                {t('downloadMod')}
            </button>

            {mod.links.discord && (
                <a href={mod.links.discord} target="_blank" rel="noopener noreferrer" className="shrink-0 aspect-square h-full">
                    <button className="bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold h-full w-full rounded-lg flex items-center justify-center transition-all shadow-lg active:scale-95" title={t('joinDiscord')}>
                        <Discord size={24} />
                    </button>
                </a>
            )}

            {/* Subscribe Button */}
            <button
                onClick={handleSubscribe}
                disabled={isLoading}
                className={`shrink-0 aspect-square h-full rounded-lg flex items-center justify-center transition-all shadow-lg active:scale-95 ${isSubscribed
                    ? 'bg-primary text-white hover:bg-red-600'
                    : 'bg-white/10 text-textMuted hover:bg-white/20 hover:text-white'
                    }`}
                title={isSubscribed ? t('unsubscribe') : t('subscribe')}
            >
                <Heart size={22} className={isSubscribed ? 'fill-current' : ''} />
            </button>
        </div>
    );
}
