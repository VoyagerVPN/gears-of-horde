"use client"

import { useMemo } from "react"
import { Link } from "@/i18n/routing"
import { usePathname } from "next/navigation"
import {
    Package, Settings, Tags, Users,
    Heart, Download, History, FileEdit, User,
    Newspaper, LucideIcon
} from "lucide-react"
import { useTranslations } from "next-intl"
import { ROUTES } from "@/lib/routes"
import EditorSubNav from "./EditorSubNav"

// Utility to normalize path by removing locale prefix
const normalizePathname = (pathname: string): string => {
    return pathname.replace(/^\/(en|ru)/, '')
}

interface NavItem {
    href: string
    icon: LucideIcon
    label: string
    roles?: string[]
    isEditorSection?: boolean
}

interface NavCategory {
    id: string
    label: string
    icon: LucideIcon
    href?: string
    items: NavItem[]
    roles?: string[]
}

interface SidebarNavProps {
    userRole: string
}

export default function SidebarNav({ userRole }: SidebarNavProps) {
    const tAdmin = useTranslations('Admin')
    const tProfile = useTranslations('Profile')
    const pathname = usePathname()

    const normalizedPath = normalizePathname(pathname)

    const isActive = (href: string) => {
        if (href === '/profile') {
            return normalizedPath === '/profile' || normalizedPath === '/profile/'
        }
        if (href === '/admin') {
            return normalizedPath === '/admin' || normalizedPath === '/admin/'
        }
        if (href === '/editor') {
            return normalizedPath === '/editor' || normalizedPath === '/editor/'
        }
        return normalizedPath.startsWith(href)
    }

    // Memoized navigation categories
    const categories = useMemo<NavCategory[]>(() => [
        {
            id: 'profile',
            label: tProfile('publicProfile'),
            icon: User,
            href: '/profile',
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
            href: ROUTES.admin,
            roles: ['ADMIN'],
            items: [
                { href: ROUTES.editor, icon: User, label: tAdmin('editor'), isEditorSection: true },
                { href: ROUTES.mods, icon: Package, label: tAdmin('modsCatalog') },
                { href: ROUTES.news, icon: Newspaper, label: tAdmin('newsManagement') },
                { href: ROUTES.tags, icon: Tags, label: tAdmin('tags') },
                { href: ROUTES.users, icon: Users, label: tAdmin('users') },
                { href: ROUTES.settings, icon: Settings, label: tAdmin('settings') },
            ]
        }
    ], [tAdmin, tProfile])

    // Filter categories and items based on user role
    const filteredCategories = useMemo(() => {
        return categories
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
    }, [categories, userRole])

    const renderNavItem = (item: NavItem) => {
        // Use EditorSubNav for editor section
        if (item.isEditorSection) {
            return <EditorSubNav key={item.href} normalizedPath={normalizedPath} />
        }

        const active = isActive(item.href)

        return (
            <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 w-full px-3 py-2 mb-1 text-xs font-bold uppercase rounded-lg transition-colors ${active
                    ? 'text-primary bg-primary/10'
                    : 'text-textMuted hover:text-white hover:bg-white/5'
                    }`}
            >
                <item.icon size={16} className="shrink-0" />
                <span>{item.label}</span>
            </Link>
        )
    }

    return (
        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
            {filteredCategories.map((category) => {
                const isHeaderActive = category.href ? isActive(category.href) : false;

                return (
                    <div key={category.id}>
                        {/* Category Header */}
                        {category.href ? (
                            <Link
                                href={category.href}
                                className={`flex items-center gap-3 px-3 py-2 mb-2 text-xs font-bold uppercase transition-colors rounded-lg ${isHeaderActive
                                    ? 'text-primary bg-primary/10'
                                    : 'text-textMuted hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <category.icon size={16} className="shrink-0" />
                                {category.label}
                            </Link>
                        ) : (
                            <div className="flex items-center gap-3 px-3 py-2 mb-2 text-xs font-bold uppercase text-textMuted">
                                <category.icon size={16} className="shrink-0" />
                                {category.label}
                            </div>
                        )}

                        {/* Category Items */}
                        <div className="space-y-0.5 ml-2 border-l border-white/10 pl-2">
                            {category.items.map((item) => renderNavItem(item))}
                        </div>
                    </div>
                );
            })}
        </nav>
    )
}
