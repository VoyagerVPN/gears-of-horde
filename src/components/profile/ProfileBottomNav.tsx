"use client"

import { Link } from "@/i18n/routing"
import { usePathname } from "next/navigation"
import { Heart, Download, History, FileEdit, User } from "lucide-react"
import { useTranslations } from "next-intl"

interface ProfileBottomNavProps {
    userRole: string
}

export default function ProfileBottomNav({ userRole }: ProfileBottomNavProps) {
    const t = useTranslations('Profile')
    const pathname = usePathname()

    // Remove locale prefix to check active state
    const normalizedPath = pathname.replace(/^\/(en|ru)/, '')

    const isActive = (href: string) => {
        if (href === '/profile') {
            return normalizedPath === '/profile' || normalizedPath === '/profile/'
        }
        return normalizedPath.startsWith(href)
    }

    const canManageMods = ['DEVELOPER', 'MODERATOR', 'ADMIN'].includes(userRole)

    const navItems = [
        { href: '/profile', icon: User, label: t('publicProfile') },
        { href: '/profile/subscriptions', icon: Heart, label: t('subscriptions') },
        { href: '/profile/downloads', icon: Download, label: t('downloads') },
        { href: '/profile/history', icon: History, label: t('history') },
        ...(canManageMods ? [{ href: '/profile/my-mods', icon: FileEdit, label: t('myMods') }] : []),
    ]

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-white/5 z-50 lg:hidden">
            <div className="flex items-center justify-around h-16">
                {navItems.map((item) => {
                    const active = isActive(item.href)
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${active
                                ? 'text-primary'
                                : 'text-textMuted hover:text-white'
                                }`}
                        >
                            <item.icon size={20} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">
                                {item.label}
                            </span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
