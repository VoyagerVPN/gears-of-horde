"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { FileText, Pencil, X, Check } from "lucide-react"
import { updateUserBio } from "@/app/actions/profile-actions"
import RichTextEditor from "@/components/ui/RichTextEditor"

interface ProfileBioCardProps {
    bio: string | null
    onBioUpdate: () => void
}

export default function ProfileBioCard({ bio, onBioUpdate }: ProfileBioCardProps) {
    const t = useTranslations('Profile')
    const [editing, setEditing] = useState(false)
    const [bioValue, setBioValue] = useState(bio || '')
    const [saving, setSaving] = useState(false)

    const handleSave = async () => {
        setSaving(true)
        try {
            const result = await updateUserBio({ bio: bioValue })
            if (result.success) {
                setEditing(false)
                onBioUpdate()
            }
        } finally {
            setSaving(false)
        }
    }

    const handleCancel = () => {
        setBioValue(bio || '')
        setEditing(false)
    }

    // Calculate remaining characters
    const charCount = bioValue.length
    const maxChars = 1000
    const isNearLimit = charCount > maxChars * 0.9

    return (
        <div className="bg-surface border border-white/5 rounded-xl p-6 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-textMuted">
                    <FileText size={16} />
                    <span className="text-sm font-medium uppercase">{t('bio')}</span>
                </div>

                {!editing ? (
                    <button
                        onClick={() => setEditing(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase text-primary hover:bg-primary/10 transition-colors"
                    >
                        <Pencil size={12} />
                        {t('editBio')}
                    </button>
                ) : (
                    <div className="flex items-center gap-2">
                        <span className={`text-xs ${isNearLimit ? 'text-orange-400' : 'text-textMuted'}`}>
                            {charCount}/{maxChars}
                        </span>
                        <button
                            onClick={handleCancel}
                            disabled={saving}
                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                            <X size={16} />
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving || charCount > maxChars}
                            className="p-1.5 rounded-lg text-green-400 hover:bg-green-500/10 transition-colors disabled:opacity-50"
                        >
                            <Check size={16} />
                        </button>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1">
                {editing ? (
                    <RichTextEditor
                        value={bioValue}
                        onChange={setBioValue}
                        placeholder={t('bioPlaceholder')}
                        minHeight="120px"
                        variant="seamless"
                    />
                ) : bio ? (
                    <div
                        className="prose prose-invert prose-sm max-w-none text-textMuted"
                        dangerouslySetInnerHTML={{ __html: bio }}
                    />
                ) : (
                    <p className="text-textMuted/50 text-sm italic">
                        {t('bioPlaceholder')}
                    </p>
                )}
            </div>
        </div>
    )
}
