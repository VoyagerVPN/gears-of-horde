"use client";

import { useTranslations } from "next-intl";
import { createClient } from "@/utils/supabase/client";
import { Heart, Bell, MessageSquare } from "lucide-react";
import { siDiscord } from "simple-icons/icons";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";

interface AuthPopoverProps {
    children: React.ReactNode;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function AuthPopover({ children, isOpen, onOpenChange }: AuthPopoverProps) {
    const t = useTranslations("AuthModal");
    const supabase = createClient();

    const handleSignIn = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'discord',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
    };

    return (
        <Popover open={isOpen} onOpenChange={onOpenChange}>
            <PopoverTrigger asChild>
                {children}
            </PopoverTrigger>
            <PopoverContent
                side="top"
                align="end"
                sideOffset={10}
                className="w-[340px] p-2 bg-[#09090b] border border-white/10 shadow-2xl rounded-2xl outline-none"
            >
                <div className="grid gap-2">
                    {/* Header Cell - Bento Style */}
                    <div className="bg-white/5 rounded-xl p-4 border border-white/5 relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary border border-primary/20">
                                    <Heart size={20} fill="currentColor" className="animate-pulse" />
                                </div>
                                <h3 className="font-bold text-lg text-white font-exo2 uppercase tracking-wide leading-none">
                                    {t('title')}
                                </h3>
                            </div>
                            <p className="text-[13px] text-textMuted leading-relaxed font-medium opacity-90">
                                {t('description')}
                            </p>
                        </div>
                    </div>

                    {/* Benefits Cell - Bento Grid */}
                    <div className="bg-white/[0.02] rounded-xl p-3 border border-white/5">
                        <div className="space-y-3">
                            <BenefitItem icon={<Heart size={14} className="text-red-400" />} text={t('benefit1')} />
                            <BenefitItem icon={<Bell size={14} className="text-yellow-400" />} text={t('benefit2')} />
                            <BenefitItem icon={<MessageSquare size={14} className="text-blue-400" />} text={t('benefit3')} />
                        </div>
                    </div>

                    {/* Action Cell - Bento Style */}
                    <button
                        onClick={handleSignIn}
                        className="group relative w-full overflow-hidden rounded-xl bg-[#5865F2] hover:bg-[#4752C4] p-3 transition-all active:scale-[0.98] shadow-lg"
                    >
                        <div className="flex items-center justify-center gap-2 relative z-10">
                            <svg role="img" viewBox="0 0 24 24" className="w-5 h-5 text-white fill-current" xmlns="http://www.w3.org/2000/svg">
                                <path d={siDiscord.path} />
                            </svg>
                            <span className="text-sm font-bold text-white uppercase tracking-wider font-exo2">
                                {t('signInDiscord')}
                            </span>
                        </div>
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    </button>

                    {/* Footer / Login hint */}
                    <div className="text-center pb-1">
                        <span className="text-[10px] text-textMuted uppercase tracking-wider font-bold opacity-40">
                            {t('benefitsTitle')}
                        </span>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}

function BenefitItem({ icon, text }: { icon: React.ReactNode; text: string }) {
    return (
        <div className="flex items-center gap-3 group">
            <div className="p-1.5 rounded-md bg-white/5 border border-white/5 text-textMuted group-hover:text-white group-hover:bg-white/10 transition-colors">
                {icon}
            </div>
            <p className="text-xs font-medium text-textMuted group-hover:text-white transition-colors leading-tight">
                {text}
            </p>
        </div>
    );
}
