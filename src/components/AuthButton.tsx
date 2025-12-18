"use client"

import { signIn, signOut, useSession } from "next-auth/react"
import { LogIn, LogOut, User } from "lucide-react"
import { Link } from "@/i18n/routing"

export default function AuthButton() {
    const { data: session, status } = useSession()

    if (status === "loading") {
        return (
            <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
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
                            <User size={16} className="text-primary" />
                        </div>
                    )}
                    <span className="text-sm text-white font-medium hidden md:block">
                        {session.user?.name}
                    </span>
                </Link>
                <button
                    onClick={() => signOut()}
                    className="p-2 hover:bg-white/10 rounded-lg text-textMuted hover:text-white transition-colors"
                    title="Sign Out"
                >
                    <LogOut size={18} />
                </button>
            </div>
        )
    }

    return (
        <button
            onClick={() => signIn("discord")}
            className="flex items-center gap-2 px-4 py-2 bg-[#5865F2] hover:bg-[#4752C4] text-white text-sm font-bold rounded-lg transition-colors"
        >
            <LogIn size={16} />
            <span className="hidden md:inline">Sign In</span>
        </button>
    )
}
