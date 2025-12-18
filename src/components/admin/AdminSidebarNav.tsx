"use client"

import { Link } from "@/i18n/routing"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Package, Settings, Tags, Users } from "lucide-react"
import { useTranslations } from "next-intl"

interface AdminSidebarNavProps {
    isAdmin: boolean
}

export default function AdminSidebarNav({ isAdmin }: AdminSidebarNavProps) {
    const t = useTranslations('Admin')
    const pathname = usePathname()

    // Remove locale prefix to check active state
    const normalizedPath = pathname.replace(/^\/(en|ru)/, '')

    const isActive = (href: string) => {
        // Exact match for dashboard, prefix match for others
        if (href === '/admin') {
            return normalizedPath === '/admin' || normalizedPath === '/admin/'
        }
        return normalizedPath.startsWith(href)
    }

    const navItems = [
        { href: '/admin', icon: LayoutDashboard, label: t('dashboard') },
        { href: '/admin/mods', icon: Package, label: t('modsCatalog') },
        { href: '/admin/tags', icon: Tags, label: t('tags') },
        ...(isAdmin ? [{ href: '/admin/users', icon: Users, label: t('users') }] : []),
        { href: '/admin/settings', icon: Settings, label: t('settings') },
    ]

    return (
        <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
                const active = isActive(item.href)
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${active
                                ? 'bg-primary/10 text-primary border-l-2 border-primary'
                                : 'text-textMuted hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <item.icon size={18} />
                        {item.label}
                    </Link>
                )
            })}
        </nav>
    )
}
