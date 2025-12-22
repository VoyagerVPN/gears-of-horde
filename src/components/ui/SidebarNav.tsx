"use client"

import { Link } from "@/i18n/routing"
import { usePathname } from "next/navigation"
import {
    Package, Settings, Tags, Users,
    Heart, Download, History, FileEdit, User,
    Newspaper,
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

interface NavCategory {
    id: string
    label: string
    icon: LucideIcon
    items: NavItem[]
    roles?: string[] // Optional: Only show category for specific roles
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

    // Navigation categories with their items
    const categories: NavCategory[] = [
        {
            id: 'profile',
            label: tProfile('publicProfile'),
            icon: User,
            items: [
                { href: '/profile/subscriptions', icon: Heart, label: tProfile('subscriptions') },
                { href: '/profile/downloads', icon: Download, label: tProfile('downloads') },
                { href: '/profile/history', icon: History, label: tProfile('history') },
                { href: ROUTES.myMods, icon: FileEdit, label: tProfile('myMods'), roles: ['DEVELOPER', 'MODERATOR', 'ADMIN'] },
            ]
        },
        {
            id: 'admin',
            label: tAdmin('admin'),
            icon: User,
            roles: ['ADMIN'],
            items: [
                { href: ROUTES.mods, icon: Package, label: tAdmin('modsCatalog') },
                { href: ROUTES.news, icon: Newspaper, label: tAdmin('newsManagement') },
                { href: ROUTES.tags, icon: Tags, label: tAdmin('tags') },
                { href: ROUTES.users, icon: Users, label: tAdmin('users') },
                { href: ROUTES.settings, icon: Settings, label: tAdmin('settings') },
            ]
        }
    ]

    // Filter categories and items based on user role
    const filteredCategories = categories
        .filter(category => {
            if (!category.roles) return true
            return category.roles.includes(userRole)
        })
        .map(category => ({
            ...category,
            items: category.items.filter(item => {
                if (!item.roles) return true
                return item.roles.includes(userRole)
            })
        }))
        .filter(category => category.items.length > 0 || category.id === 'profile')

    return (
        <nav className="flex-1 p-4 space-y-2">
            {filteredCategories.map((category) => (
                <div key={category.id} className="space-y-0">
                    {/* Category Header */}
                    <div className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-textMuted">
                        <category.icon size={18} className="shrink-0" />
                        {category.label}
                    </div>

                    {/* Category Items with Smooth Curves */}
                    <div className="relative ml-[25px]">
                        {/* Vertical line */}
                        <div className="absolute left-0 top-0 bottom-4 w-[2px] bg-white/10" />

                        {category.items.map((item) => {
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
                </div>
            ))}
        </nav>
    )
}
