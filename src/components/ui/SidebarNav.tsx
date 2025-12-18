"use client"

import { Link } from "@/i18n/routing"
import { usePathname } from "next/navigation"
import {
    Package, Settings, Tags, Users,
    Heart, Download, History, FileEdit, User,
    LucideIcon
} from "lucide-react"
import { useTranslations } from "next-intl"
import { ROUTES } from "@/lib/routes"

interface NavItem {
    href: string
    icon: LucideIcon
    label: string
    roles?: string[] // Optional: Only show for specific roles
}

interface SidebarNavProps {
    userRole: string
}

export default function SidebarNav({ userRole }: SidebarNavProps) {
    const tAdmin = useTranslations('Admin')
    const tProfile = useTranslations('Profile')
    const pathname = usePathname()

    // Remove locale prefix to check active state
    const normalizedPath = pathname.replace(/^\/(en|ru)/, '')

    const isActive = (href: string) => {
        // Exact match for profile root
        if (href === '/profile') {
            return normalizedPath === '/profile' || normalizedPath === '/profile/'
        }
        return normalizedPath.startsWith(href)
    }

    // All navigation items (profile + admin)
    const navItems: NavItem[] = [
        // Profile items (all users)
        { href: '/profile', icon: User, label: tProfile('publicProfile') },
        { href: '/profile/subscriptions', icon: Heart, label: tProfile('subscriptions') },
        { href: '/profile/downloads', icon: Download, label: tProfile('downloads') },
        { href: '/profile/history', icon: History, label: tProfile('history') },
        { href: ROUTES.myMods, icon: FileEdit, label: tProfile('myMods'), roles: ['DEVELOPER', 'MODERATOR', 'ADMIN'] },
        // Admin items (ADMIN only)
        { href: ROUTES.mods, icon: Package, label: tAdmin('modsCatalog'), roles: ['ADMIN'] },
        { href: ROUTES.tags, icon: Tags, label: tAdmin('tags'), roles: ['ADMIN'] },
        { href: ROUTES.users, icon: Users, label: tAdmin('users'), roles: ['ADMIN'] },
        { href: ROUTES.settings, icon: Settings, label: tAdmin('settings'), roles: ['ADMIN'] },
    ]

    // Filter items based on user role
    const filteredItems = navItems.filter(item => {
        if (!item.roles) return true
        return item.roles.includes(userRole)
    })

    const [rootItem, ...childrenItems] = filteredItems

    return (
        <nav className="flex-1 p-4 space-y-0">
            {/* Root Item (Profile) */}
            {rootItem && (() => {
                const active = isActive(rootItem.href)
                return (
                    <Link
                        key={rootItem.href}
                        href={rootItem.href}
                        className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors relative z-10 ${active
                            ? 'bg-primary/10 text-primary border-l-2 border-primary'
                            : 'text-textMuted hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <rootItem.icon size={18} className="shrink-0" />
                        {rootItem.label}
                    </Link>
                )
            })()}

            {/* Children Items with Smooth Curves */}
            <div className="relative ml-[25px]">
                {/* Vertical line */}
                <div className="absolute left-0 top-0 bottom-4 w-[2px] bg-white/10" />

                {childrenItems.map((item, index) => {
                    const active = isActive(item.href)

                    return (
                        <div key={item.href} className="relative">
                            {/* Curved connector using SVG */}
                            <svg
                                className="absolute left-0 top-0 w-4 h-full pointer-events-none"
                                viewBox="0 0 16 40"
                                preserveAspectRatio="none"
                                style={{ height: '100%' }}
                            >
                                <path
                                    d={`M 0 0 L 0 20 Q 0 28 8 28 L 16 28`}
                                    fill="none"
                                    stroke="rgba(255,255,255,0.1)"
                                    strokeWidth="2"
                                />
                            </svg>

                            <Link
                                href={item.href}
                                className={`flex items-center gap-3 ml-4 pl-4 py-2.5 text-xs font-bold uppercase rounded-r-lg transition-colors ${active
                                    ? 'text-primary bg-primary/5'
                                    : 'text-textMuted hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <item.icon size={16} className="shrink-0" />
                                {item.label}
                            </Link>
                        </div>
                    )
                })}
            </div>
        </nav>
    )
}
