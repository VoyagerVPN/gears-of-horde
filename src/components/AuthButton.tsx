"use client"

import { signIn, signOut, useSession } from "next-auth/react"
import { LogIn, LogOut, User } from "lucide-react"
import { Link } from "@/i18n/routing"
import { siDiscord } from "simple-icons/icons"
import { useTranslations } from "next-intl"

export default function AuthButton() {
    const { data: session, status } = useSession()
    const t = useTranslations("Common")

    if (status === "loading") {
        return (
            <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" aria-label="Loading" />
        )
    }

    if (session) {
        return (
            <div className="flex items-center gap-3">
                <Link href="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    {session.user?.image ? (
                        <img
                            src={session.user.image}
                            alt={session.user.name || "User"}
                            className="w-8 h-8 rounded-full border border-white/10"
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                            <User size={16} className="text-primary" aria-hidden="true" />
                        </div>
                    )}
                    <span className="text-sm text-white font-medium hidden md:block">
                        {session.user?.name}
                    </span>
                </Link>
                <button
                    onClick={() => signOut()}
                    className="p-2 hover:bg-white/10 rounded-lg text-textMuted hover:text-white transition-colors"
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
            className="flex items-center gap-2 px-4 py-2 bg-[#5865F2] hover:bg-[#4752C4] text-white text-sm font-bold rounded-lg transition-colors"
            aria-label={t("signIn")}
        >
            <svg role="img" viewBox="0 0 24 24" className="w-4 h-4 text-white fill-current" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d={siDiscord.path} />
            </svg>
            <span className="hidden md:inline">{t("signIn")}</span>
        </button>
    )
}

