"use client"

import { useTranslations } from "next-intl"
import { Award } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/Tooltip"

interface Badge {
    id: string
    slug: string
    name: string
    icon: string
    description: string
    rarity: string
    earnedAt: string
}

interface ProfileBadgesCardProps {
    badges: Badge[]
}

const rarityColors: Record<string, { bg: string; border: string; text: string }> = {
    common: { bg: 'bg-gray-500/10', border: 'border-gray-500/30', text: 'text-gray-400' },
    rare: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' },
    epic: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400' },
    legendary: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400' }
}

function formatDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

export default function ProfileBadgesCard({ badges }: ProfileBadgesCardProps) {
    const t = useTranslations('Profile')

    if (badges.length === 0) {
        return null
    }

    return (
        <div className="bg-surface border border-white/5 rounded-xl p-6">
            <div className="flex items-center gap-2 text-textMuted mb-4">
                <Award size={16} />
                <span className="text-sm font-medium uppercase">{t('badges')}</span>
            </div>

            <TooltipProvider>
                <div className="flex flex-wrap gap-3">
                    {badges.map(badge => {
                        const colors = rarityColors[badge.rarity] || rarityColors.common
                        return (
                            <Tooltip key={badge.id}>
                                <TooltipTrigger asChild>
                                    <div
                                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border cursor-help transition-all hover:scale-105 ${colors.bg} ${colors.border}`}
                                    >
                                        <span className="text-xl">{badge.icon}</span>
                                        <span className={`text-sm font-bold ${colors.text}`}>
                                            {badge.name}
                                        </span>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <div className="text-center">
                                        <p className="font-bold text-white">{badge.name}</p>
                                        <p className="text-xs text-textMuted mt-1">{badge.description}</p>
                                        <p className="text-xs text-textMuted/60 mt-2">
                                            Earned {formatDate(badge.earnedAt)}
                                        </p>
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        )
                    })}
                </div>
            </TooltipProvider>
        </div>
    )
}
