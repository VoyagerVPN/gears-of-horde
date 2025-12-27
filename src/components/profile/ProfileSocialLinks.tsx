"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Link2, Plus, Trash2, Pencil, X } from "lucide-react"
import { updateSocialLinks, deleteSocialLink } from "@/app/actions/profile-actions"
import {
    siDiscord,
    siSteam,
    siYoutube,
    siTwitch,
    siGithub
} from "simple-icons"

interface ProfileSocialLinksProps {
    links: { id: string; platform: string; url: string }[]
    onLinksUpdate: () => void
}

const platformConfig: Record<string, { icon: { path: string }; color: string; label: string }> = {
    discord: { icon: siDiscord, color: '#5865F2', label: 'Discord' },
    steam: { icon: siSteam, color: '#00ADEE', label: 'Steam' },
    youtube: { icon: siYoutube, color: '#FF0000', label: 'YouTube' },
    twitch: { icon: siTwitch, color: '#9146FF', label: 'Twitch' },
    github: { icon: siGithub, color: '#181717', label: 'GitHub' },
    boosty: { icon: { path: '' }, color: '#FF6D3D', label: 'Boosty' }
}

function SocialIcon({ platform, size = 16 }: { platform: string; size?: number }) {
    const config = platformConfig[platform]
    if (!config?.icon.path) {
        // Fallback for boosty or unknown platforms
        return <Link2 size={size} />
    }

    return (
        <svg
            role="img"
            viewBox="0 0 24 24"
            width={size}
            height={size}
            fill="currentColor"
        >
            <path d={config.icon.path} />
        </svg>
    )
}

export default function ProfileSocialLinks({ links, onLinksUpdate }: ProfileSocialLinksProps) {
    const t = useTranslations('Profile')
    const [editing, setEditing] = useState(false)
    const [newPlatform, setNewPlatform] = useState('')
    const [newUrl, setNewUrl] = useState('')
    const [saving, setSaving] = useState(false)

    const availablePlatforms = Object.keys(platformConfig).filter(
        platform => !links.some(link => link.platform === platform)
    )

    const handleAddLink = async () => {
        if (!newPlatform || !newUrl) return

        setSaving(true)
        try {
            const updatedLinks = [
                ...links,
                { platform: newPlatform, url: newUrl }
            ]
            await updateSocialLinks(updatedLinks.map(l => ({ platform: l.platform, url: l.url })))
            setNewPlatform('')
            setNewUrl('')
            onLinksUpdate()
        } finally {
            setSaving(false)
        }
    }

    const handleDeleteLink = async (platform: string) => {
        setSaving(true)
        try {
            await deleteSocialLink(platform)
            onLinksUpdate()
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="bg-surface border border-white/5 rounded-xl p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-textMuted">
                    <Link2 size={16} />
                    <span className="text-sm font-medium uppercase">{t('socialLinks')}</span>
                </div>

                <button
                    onClick={() => setEditing(!editing)}
                    className="p-1.5 rounded-lg text-textMuted hover:text-white hover:bg-white/5 transition-colors"
                >
                    {editing ? <X size={16} /> : <Pencil size={16} />}
                </button>
            </div>

            {/* Links Display */}
            <div className="space-y-2">
                {links.length === 0 && !editing ? (
                    <p className="text-textMuted/50 text-sm italic py-4 text-center">
                        No social links added
                    </p>
                ) : (
                    links.map(link => {
                        const config = platformConfig[link.platform] || { color: '#fff', label: link.platform }
                        return (
                            <div
                                key={link.id}
                                className="flex items-center gap-3 p-2 rounded-lg bg-background/50 border border-white/5 group"
                            >
                                <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                                    style={{ backgroundColor: config.color + '20', color: config.color }}
                                >
                                    <SocialIcon platform={link.platform} size={16} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-textMuted uppercase">{config.label}</p>
                                    <a
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-white hover:text-primary truncate block transition-colors"
                                    >
                                        {link.url}
                                    </a>
                                </div>
                                {editing && (
                                    <button
                                        onClick={() => handleDeleteLink(link.platform)}
                                        disabled={saving}
                                        className="p-1.5 rounded-lg text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 transition-all"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                        )
                    })
                )}
            </div>

            {/* Add New Link */}
            {editing && availablePlatforms.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2">
                        <select
                            value={newPlatform}
                            onChange={(e) => setNewPlatform(e.target.value)}
                            className="bg-background border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                        >
                            <option value="">Select platform</option>
                            {availablePlatforms.map(platform => (
                                <option key={platform} value={platform}>
                                    {platformConfig[platform]?.label || platform}
                                </option>
                            ))}
                        </select>
                        <input
                            type="url"
                            value={newUrl}
                            onChange={(e) => setNewUrl(e.target.value)}
                            placeholder="URL..."
                            className="flex-1 bg-background border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-textMuted/50 focus:border-primary focus:outline-none"
                        />
                        <button
                            onClick={handleAddLink}
                            disabled={!newPlatform || !newUrl || saving}
                            className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
