"use client"

import { Link } from "@/i18n/routing"
import { usePathname } from "next/navigation"
import { Heart, Download, History, FileEdit, User, Shield, Package, Tags } from "lucide-react"
import { useTranslations } from "next-intl"
import { ROUTES } from "@/lib/routes"

interface ProfileBottomNavProps {
    userRole: string
}

export default function ProfileBottomNav({ userRole }: ProfileBottomNavProps) {
    const tProfile = useTranslations('Profile')
    const tAdmin = useTranslations('Admin')
    const pathname = usePathname()

    // Remove locale prefix to check active state
    const normalizedPath = pathname.replace(/^\/(en|ru)/, '')

    const isActive = (href: string) => {
        if (href === '/profile') {
            return normalizedPath === '/profile' || normalizedPath === '/profile/'
        }
        if (href === '/admin') {
            return normalizedPath === '/admin' || normalizedPath === '/admin/'
        }
        return normalizedPath.startsWith(href)
    }

    const canManageMods = ['DEVELOPER', 'MODERATOR', 'ADMIN'].includes(userRole)
    const isAdmin = userRole === 'ADMIN'

    // Check if we're in admin section
    const isInAdminSection = normalizedPath.startsWith('/admin')

    // Profile-focused nav items
    const profileNavItems = [
        { href: '/profile', icon: User, label: tProfile('publicProfile') },
        { href: '/profile/subscriptions', icon: Heart, label: tProfile('subscriptions') },
        { href: '/profile/downloads', icon: Download, label: tProfile('downloads') },
        { href: '/profile/history', icon: History, label: tProfile('history') },
        ...(canManageMods ? [{ href: '/profile/my-mods', icon: FileEdit, label: tProfile('myMods') }] : []),
        ...(isAdmin ? [{ href: ROUTES.admin, icon: Shield, label: tAdmin('admin') }] : []),
    ]

    // Admin-focused nav items (shown when in admin section)
    const adminNavItems = [
        { href: '/profile', icon: User, label: tProfile('publicProfile') },
        { href: ROUTES.admin, icon: Shield, label: tAdmin('dashboard') },
        { href: ROUTES.mods, icon: Package, label: tAdmin('mods') },
        { href: ROUTES.tags, icon: Tags, label: tAdmin('tags') },
    ]

    const navItems = isAdmin && isInAdminSection ? adminNavItems : profileNavItems

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-white/5 z-50 lg:hidden">
            <div className="flex items-center justify-around h-16">
                {navItems.map((item) => {
                    const active = isActive(item.href)
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${active
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
