"use client"

import { useState, useEffect, useMemo } from "react"
import { useTranslations } from 'next-intl'
import { Ban, RefreshCw, Check, ChevronDown } from "lucide-react"
import { fetchAllUsers, updateUserRole, toggleUserBan, UserData } from "@/app/actions/user-actions"
import { UserRole } from "@prisma/client"
import SearchBar from "@/components/ui/SearchBar"
import * as Select from "@radix-ui/react-select"

export default function AdminUsersPage() {
    const t = useTranslations('Admin')
    const [users, setUsers] = useState<UserData[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [sortOption, setSortOption] = useState<'name' | 'newest'>('newest')
    const [refreshTrigger, setRefreshTrigger] = useState(0)

    useEffect(() => {
        fetchAllUsers().then(setUsers)
    }, [refreshTrigger])

    const handleRoleChange = async (userId: string, role: string) => {
        await updateUserRole(userId, role as UserRole)
        setRefreshTrigger(r => r + 1)
    }

    const handleBan = async (userId: string) => {
        await toggleUserBan(userId)
        setRefreshTrigger(r => r + 1)
    }

    const filteredUsers = useMemo(() => {
        let result = users.filter(u =>
            u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        if (sortOption === 'name') {
            result.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
        } else {
            result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        }
        return result
    }, [users, searchQuery, sortOption])

    const roleColors: Record<UserRole, string> = {
        ADMIN: "bg-red-500/10 text-red-400 border-red-500/20",
        MODERATOR: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        DEVELOPER: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        USER: "bg-white/5 text-textMuted border-white/10"
    }

    return (
        <div className="min-h-screen bg-zinc-950 pb-20">
            <div className="max-w-[1600px] w-full mx-auto px-6 py-8 space-y-8">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-white font-exo2">{t('users')}</h1>
                </div>

                {/* Toolbar - SAME PATTERN AS AdminModsPage/AdminTagsPage */}
                <div className="flex flex-col md:flex-row items-center gap-4 bg-surface p-4 rounded-xl border border-white/5 shadow-sm">
                    <SearchBar
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder={t('searchUsers')}
                        variant="compact"
                    />

                    <div className="flex items-center gap-2 w-full md:w-auto ml-auto">
                        <div className="flex bg-black/20 rounded-md p-0.5 border border-white/10">
                            <button
                                onClick={() => setSortOption('name')}
                                className={`px-3 py-1.5 rounded-[4px] text-xs font-bold transition-colors ${sortOption === 'name' ? 'bg-white/10 text-white' : 'text-textMuted hover:text-white'}`}
                            >
                                {t('name')}
                            </button>
                            <button
                                onClick={() => setSortOption('newest')}
                                className={`px-3 py-1.5 rounded-[4px] text-xs font-bold transition-colors ${sortOption === 'newest' ? 'bg-white/10 text-white' : 'text-textMuted hover:text-white'}`}
                            >
                                {t('newest')}
                            </button>
                        </div>

                        <button
                            onClick={() => setRefreshTrigger(prev => prev + 1)}
                            className="p-2 hover:bg-white/10 rounded-lg text-textMuted hover:text-white transition-colors"
                            title="Refresh"
                        >
                            <RefreshCw size={18} />
                        </button>
                    </div>
                </div>

                {/* Users Table - SAME PATTERN AS AdminModsPage */}
                <div className="bg-surface border border-white/5 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-white/5 text-textMuted uppercase text-xs font-bold tracking-wider">
                            <tr>
                                <th className="px-6 py-4">{t('user')}</th>
                                <th className="px-6 py-4">{t('role')}</th>
                                <th className="px-6 py-4">{t('mods')}</th>
                                <th className="px-6 py-4">{t('status')}</th>
                                <th className="px-6 py-4 text-right">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredUsers.map(user => (
                                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {user.image && <img src={user.image} className="w-8 h-8 rounded-full" alt="" />}
                                            <div>
                                                <div className="text-white font-bold">{user.name || "Unknown"}</div>
                                                <div className="text-textMuted text-xs">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Select.Root value={user.role} onValueChange={(val) => handleRoleChange(user.id, val)}>
                                            <Select.Trigger className={`inline-flex items-center gap-2 px-3 py-1.5 rounded border text-xs font-bold cursor-pointer outline-none transition-colors hover:bg-white/5 ${roleColors[user.role]}`}>
                                                <Select.Value />
                                                <Select.Icon>
                                                    <ChevronDown size={12} />
                                                </Select.Icon>
                                            </Select.Trigger>
                                            <Select.Portal>
                                                <Select.Content className="bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl z-[100] overflow-hidden min-w-[140px]">
                                                    <Select.Viewport className="p-1">
                                                        {(['USER', 'MODERATOR', 'DEVELOPER', 'ADMIN'] as UserRole[]).map((role) => (
                                                            <Select.Item
                                                                key={role}
                                                                value={role}
                                                                className={`flex items-center justify-between gap-2 px-3 py-2 text-xs font-bold rounded cursor-pointer outline-none transition-colors hover:bg-white/10 ${roleColors[role]} data-[state=checked]:bg-white/5`}
                                                            >
                                                                <Select.ItemText>{t(`role${role.charAt(0) + role.slice(1).toLowerCase()}`)}</Select.ItemText>
                                                                <Select.ItemIndicator>
                                                                    <Check size={12} className="text-primary" />
                                                                </Select.ItemIndicator>
                                                            </Select.Item>
                                                        ))}
                                                    </Select.Viewport>
                                                </Select.Content>
                                            </Select.Portal>
                                        </Select.Root>
                                    </td>
                                    <td className="px-6 py-4 text-textMuted">{user._count?.mods || 0}</td>
                                    <td className="px-6 py-4">
                                        {user.isBanned ? (
                                            <span className="px-2.5 py-1 rounded text-[10px] font-bold uppercase bg-red-500/10 text-red-400 border border-red-500/20">{t('statusBanned')}</span>
                                        ) : (
                                            <span className="px-2.5 py-1 rounded text-[10px] font-bold uppercase bg-green-500/10 text-green-400 border border-green-500/20">{t('statusActive')}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleBan(user.id)}
                                                className={`p-2 rounded transition-colors ${user.isBanned ? 'hover:bg-green-500/10 text-green-400' : 'hover:bg-red-500/10 text-red-400'}`}
                                                title={user.isBanned ? t('unbanUser') : t('banUser')}
                                            >
                                                <Ban size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredUsers.length === 0 && (
                        <div className="text-center py-12 text-textMuted">
                            {users.length === 0 ? t('noUsersYet') : t('noUsersMatch')}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
