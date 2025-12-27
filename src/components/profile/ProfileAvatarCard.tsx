"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Eye, EyeOff, Shield, Code, User as UserIcon } from "lucide-react"
import Image from "next/image"
import { toggleProfileVisibility } from "@/app/actions/profile-actions"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/Tooltip"

interface ProfileAvatarCardProps {
    name: string | null
    image: string | null
    role: string
    isPublic: boolean
    onVisibilityChange: () => void
}

const roleConfig: Record<string, { icon: React.ElementType; color: string; bgColor: string }> = {
    ADMIN: { icon: Shield, color: 'text-red-400', bgColor: 'bg-red-500/10' },
    MODERATOR: { icon: Shield, color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
    DEVELOPER: { icon: Code, color: 'text-green-400', bgColor: 'bg-green-500/10' },
    USER: { icon: UserIcon, color: 'text-textMuted', bgColor: 'bg-white/5' }
}

export default function ProfileAvatarCard({
    name,
    image,
    role,
    isPublic,
    onVisibilityChange
}: ProfileAvatarCardProps) {
    const t = useTranslations('Profile')
    const tAdmin = useTranslations('Admin')
    const [toggling, setToggling] = useState(false)

    const roleInfo = roleConfig[role] || roleConfig.USER
    const RoleIcon = roleInfo.icon

    const handleToggleVisibility = async () => {
        setToggling(true)
        try {
            await toggleProfileVisibility()
            onVisibilityChange()
        } finally {
            setToggling(false)
        }
    }

    const roleName = role === 'ADMIN' ? tAdmin('roleAdmin')
        : role === 'MODERATOR' ? tAdmin('roleModerator')
            : role === 'DEVELOPER' ? tAdmin('roleDeveloper')
                : tAdmin('roleUser')

    return (
        <div className="bg-surface border border-white/5 rounded-xl p-6 flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="relative mb-4">
                {image ? (
                    <Image
                        src={image}
                        alt={name || 'User avatar'}
                        width={96}
                        height={96}
                        className="rounded-full border-2 border-primary/30 object-cover"
                    />
                ) : (
                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/30">
                        <UserIcon size={40} className="text-primary/50" />
                    </div>
                )}
            </div>

            {/* Name */}
            <h2 className="text-xl font-bold text-white mb-2 truncate max-w-full">
                {name || 'Anonymous'}
            </h2>

            {/* Role Badge */}
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase ${roleInfo.color} ${roleInfo.bgColor} mb-4`}>
                <RoleIcon size={12} />
                {roleName}
            </div>

            {/* Visibility Toggle */}
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            onClick={handleToggleVisibility}
                            disabled={toggling}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${isPublic
                                ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                                : 'bg-orange-500/10 text-orange-400 hover:bg-orange-500/20'
                                } ${toggling ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isPublic ? <Eye size={14} /> : <EyeOff size={14} />}
                            {isPublic ? t('profilePublic') : t('profilePrivate')}
                        </button>
                    </TooltipTrigger>
                    <TooltipContent>
                        {isPublic ? t('profilePublic') : t('profilePrivate')}
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    )
}
