"use client";

import { useState, useEffect } from "react";
import { Download, Heart, AlertTriangle } from "lucide-react";
import { siDiscord } from "simple-icons/icons";
import { toggleSubscription, getSubscriptionStatus } from "@/app/actions/subscription-actions";
import { recordDownload, recordView, recordAnonymousView } from "@/app/actions/analytics-actions";
import type { ModData } from "@/schemas";
import { useSupabaseAuth } from "@/components/SupabaseAuthProvider";
import AuthPopover from "@/components/mod/editor/AuthPopover";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";

interface ViewModeActionsProps {
    mod: ModData;
    t: (key: string) => string;
}

/**
 * View mode action buttons: Download, Discord, and Subscribe
 * Handles download tracking, view tracking, and subscription state
 */
export default function ViewModeActions({ mod, t }: ViewModeActionsProps) {
    const { session } = useSupabaseAuth();
    const isAuthenticated = !!session;
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isAuthOpen, setIsAuthOpen] = useState(false);

    useEffect(() => {
        // Check subscription status on mount if authenticated
        if (isAuthenticated) {
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
        if (!isAuthenticated) {
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
            {isAuthenticated ? (
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

            {mod.isSaveBreaking ? (
                <Popover>
                    <PopoverTrigger asChild>
                        <button
                            className="flex-1 relative overflow-hidden bg-primary hover:bg-red-600 text-white font-bold h-full rounded-lg flex flex-col items-center justify-center transition-all uppercase tracking-wider font-exo2 group"
                            title={t('wipeRequiredDesc')}
                        >
                            <div className="absolute top-0 left-0 right-0 h-[18px] bg-red-900/40 flex items-center justify-center gap-1.5">
                                <AlertTriangle size={10} className="text-red-200" />
                                <span className="text-[9px] text-red-100 font-bold tracking-widest leading-none">{t('wipeRequired')}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-3">
                                <Download size={18} />
                                <span>{t('downloadMod')}</span>
                            </div>
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 border-red-500/20 bg-surface shadow-xl p-4">
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <div className="p-2 bg-red-500/10 rounded-lg h-fit text-red-500">
                                    <AlertTriangle size={20} />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-bold text-sm text-red-500 font-exo2 uppercase leading-none mt-1">{t('wipeRequired')}</h4>
                                    <p className="text-xs text-textMuted leading-relaxed">
                                        {t('wipeRequiredDesc')}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleDownload}
                                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-lg text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                            >
                                <Download size={14} />
                                {t('downloadMod')}
                            </button>
                        </div>
                    </PopoverContent>
                </Popover>
            ) : (
                <button
                    onClick={handleDownload}
                    className="flex-1 bg-primary hover:bg-red-600 text-white font-bold h-full rounded-lg flex items-center justify-center gap-2 transition-all uppercase tracking-wider font-exo2"
                >
                    <Download size={20} />
                    {t('downloadMod')}
                </button>
            )}

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


