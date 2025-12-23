"use client";

import { useState, useEffect } from "react";
import { Download, Heart } from "lucide-react";
import { siDiscord } from "simple-icons/icons";
import { toggleSubscription, getSubscriptionStatus, recordDownload, recordView, recordAnonymousView } from "@/app/actions/profile-actions";
import type { ModData } from "@/schemas";
import { useSession } from "next-auth/react";
import AuthPopover from "./AuthPopover";

interface ViewModeActionsProps {
    mod: ModData;
    t: (key: string) => string;
}

/**
 * View mode action buttons: Download, Discord, and Subscribe
 * Handles download tracking, view tracking, and subscription state
 */
export default function ViewModeActions({ mod, t }: ViewModeActionsProps) {
    const { status } = useSession();
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isAuthOpen, setIsAuthOpen] = useState(false);

    useEffect(() => {
        // Check subscription status on mount if authenticated
        if (status === "authenticated") {
            getSubscriptionStatus(mod.slug).then(({ subscribed }) => {
                setIsSubscribed(subscribed);
            });
        } else {
            setIsSubscribed(false);
        }

        // Record view when component mounts
        // Try authenticated view first, then fall back to anonymous
        recordView(mod.slug).then((result) => {
            if (!result?.recorded) {
                // User not authenticated, record anonymous view (uses IP on server)
                recordAnonymousView(mod.slug);
            }
        });
    }, [mod.slug, status]);

    const handleSubscribe = async () => {
        if (status !== "authenticated") {
            setIsAuthOpen(true);
            return;
        }

        setIsLoading(true);
        try {
            const { subscribed } = await toggleSubscription(mod.slug);
            setIsSubscribed(subscribed);
        } catch (error) {
            console.error("Failed to toggle subscription:", error);
        } finally {
            setIsLoading(false);
        }
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
            {status === "authenticated" ? (
                <button
                    onClick={handleSubscribe}
                    disabled={isLoading}
                    className={`shrink-0 aspect-square h-full rounded-lg flex items-center justify-center transition-all border border-white/5 ${isSubscribed
                        ? 'bg-primary text-white'
                        : 'bg-white/5 text-textMuted hover:bg-white/10 hover:text-white'
                        }`}
                    title={isSubscribed ? t('unsubscribe') : t('subscribe')}
                >
                    <Heart size={20} className={isSubscribed ? 'fill-current' : ''} />
                </button>
            ) : (
                <AuthPopover isOpen={isAuthOpen} onOpenChange={setIsAuthOpen}>
                    <button
                        onClick={handleSubscribe}
                        disabled={isLoading}
                        className={`shrink-0 aspect-square h-full rounded-lg flex items-center justify-center transition-all border border-white/5 ${isSubscribed
                            ? 'bg-primary text-white'
                            : 'bg-white/5 text-textMuted hover:bg-white/10 hover:text-white'
                            }`}
                        title={isSubscribed ? t('unsubscribe') : t('subscribe')}
                    >
                        <Heart size={20} className={isSubscribed ? 'fill-current' : ''} />
                    </button>
                </AuthPopover>
            )}

            <button
                onClick={handleDownload}
                className="flex-1 bg-primary hover:bg-red-600 text-white font-bold h-full rounded-lg flex items-center justify-center gap-2 transition-all uppercase tracking-wider font-exo2"
            >
                <Download size={20} />
                {t('downloadMod')}
            </button>

            {mod.links.discord && (
                <a href={mod.links.discord} target="_blank" rel="noopener noreferrer" className="shrink-0 aspect-square h-full">
                    <button
                        className="bg-[#5865F2] hover:bg-[#4752C4] text-white h-full w-full rounded-lg flex items-center justify-center transition-all"
                        title={t('joinDiscord')}
                    >
                        <svg role="img" viewBox="0 0 24 24" className="w-6 h-6 fill-current" xmlns="http://www.w3.org/2000/svg">
                            <path d={siDiscord.path} />
                        </svg>
                    </button>
                </a>
            )}
        </div>
    );
}


