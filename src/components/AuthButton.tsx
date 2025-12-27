"use client"

import { signOut, useSession, signIn } from "next-auth/react"
import Image from "next/image"
import { LogOut, User } from "lucide-react"
import { Link } from "@/i18n/routing"
import { siDiscord } from "simple-icons/icons"
import { useTranslations } from "next-intl"

export default function AuthButton() {
    const { data: session, status } = useSession()
    const t = useTranslations("Common")

    if (status === "loading") {
        return (
            <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse" aria-label="Loading" />
        )
    }

    if (session) {
        return (
            <div className="flex items-center gap-2">
                <Link
                    href="/profile"
                    className="flex items-center gap-3 pl-1 pr-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all group"
                >
                    {session.user?.image ? (
                        <Image
                            src={session.user.image}
                            alt={session.user.name || "User"}
                            width={32}
                            height={32}
                            className="rounded-full border border-white/10 group-hover:border-primary/50 transition-colors object-cover"
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                            <User size={16} className="text-primary" aria-hidden="true" />
                        </div>
                    )}
                    <div className="flex flex-col text-left">
                        <span className="text-sm font-semibold text-white leading-tight group-hover:text-primary transition-colors">
                            {session.user?.name}
                        </span>
                        <span className="text-[10px] text-textMuted leading-tight uppercase tracking-wide">
                            User
                        </span>
                    </div>
                </Link>
                <button
                    onClick={() => signOut()}
                    className="p-2.5 hover:bg-red-500/10 rounded-lg text-textMuted hover:text-red-400 border border-transparent hover:border-red-500/20 transition-all font-locust"
                    aria-label={t("signOut")}
                    title={t("signOut")}
                >
                    <LogOut size={18} aria-hidden="true" />
                </button>
            </div>
        )
    }

    return (
        <button
            onClick={() => signIn("discord")}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#5865F2] hover:bg-[#4752C4] text-white text-sm font-bold rounded-lg transition-all shadow-lg shadow-[#5865F2]/20 hover:shadow-[#5865F2]/40"
            aria-label={t("signIn")}
        >
            <svg role="img" viewBox="0 0 24 24" className="w-5 h-5 text-white fill-current" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d={siDiscord.path} />
            </svg>
            <span className="hidden md:inline">{t("signIn")}</span>
        </button>
    )
}

