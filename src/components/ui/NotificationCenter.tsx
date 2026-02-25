"use client"

import { useState, useRef, useEffect } from "react"
import { Bell, Package, MessageSquare, AlertCircle, Check, ExternalLink } from "lucide-react"
import { useNotifications, Notification } from "@/hooks/use-notifications"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/routing"

export default function NotificationCenter() {
    const t = useTranslations('Notifications')
    const { notifications, unreadCount, markAsRead, markAllAsRead, isLoading } = useNotifications()
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const getIcon = (type: Notification['type']) => {
        switch (type) {
            case 'MOD_UPDATE': return <Package className="text-primary" size={16} />
            case 'COMMENT_REPLY': return <MessageSquare className="text-blue-400" size={16} />
            case 'SYSTEM_ANNOUNCEMENT': return <AlertCircle className="text-yellow-400" size={16} />
            default: return <Bell size={16} />
        }
    }

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`relative p-2 rounded-xl transition-all ${
                    isOpen ? 'bg-primary/20 text-primary' : 'text-textMuted hover:text-white hover:bg-white/5'
                }`}
                aria-label={t('title')}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white border-2 border-background animate-in fade-in zoom-in duration-300">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 max-h-[480px] flex flex-col bg-surface border border-white/10 rounded-2xl shadow-2xl z-[60] overflow-hidden animate-in slide-in-from-top-2 duration-200">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">{t('title')}</h3>
                        {unreadCount > 0 && (
                            <button 
                                onClick={markAllAsRead}
                                className="text-[10px] text-primary hover:text-primaryLight transition-colors font-bold uppercase"
                            >
                                {t('markAllAsRead')}
                            </button>
                        )}
                    </div>

                    {/* Notification List */}
                    <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
                        {isLoading && notifications.length === 0 ? (
                            <div className="py-8 text-center text-textMuted text-xs italic">
                                {t('title')}...
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="py-12 flex flex-col items-center justify-center gap-3 text-textMuted text-center px-6">
                                <Bell className="opacity-20" size={40} />
                                <div>
                                    <p className="text-sm font-medium text-white/50">{t('noNotifications')}</p>
                                    <p className="text-[10px]">{t('empty')}</p>
                                </div>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div 
                                    key={notification.id}
                                    className={`relative px-4 py-3 flex gap-3 transition-colors hover:bg-white/5 group border-b border-white/5 last:border-0 ${
                                        !notification.isRead ? 'bg-primary/5' : ''
                                    }`}
                                >
                                    <div className="shrink-0 mt-1">
                                        {getIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <span className="text-[10px] font-bold text-primary uppercase tracking-tighter">
                                                {t(`types.${notification.type}`)}
                                            </span>
                                            {!notification.isRead && (
                                                <button 
                                                    onClick={() => markAsRead(notification.id)}
                                                    className="opacity-0 group-hover:opacity-100 p-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-all"
                                                    title="Mark as read"
                                                >
                                                    <Check size={10} />
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-xs font-bold text-white mb-1 leading-tight line-clamp-2">
                                            {notification.title}
                                        </p>
                                        <p className="text-[11px] text-textMuted mb-2 line-clamp-2 leading-relaxed">
                                            {notification.message}
                                        </p>
                                        {notification.link && (
                                            <Link 
                                                href={notification.link}
                                                className="inline-flex items-center gap-1.5 text-[10px] text-primary hover:text-primaryLight font-bold uppercase transition-colors"
                                                onClick={() => {
                                                    markAsRead(notification.id)
                                                    setIsOpen(false)
                                                }}
                                            >
                                                <span>View details</span>
                                                <ExternalLink size={10} />
                                            </Link>
                                        )}
                                        <div className="mt-2 text-[9px] text-white/20">
                                            {new Date(notification.createdAt).toLocaleString(undefined, { 
                                                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                                            })}
                                        </div>
                                    </div>
                                    {!notification.isRead && (
                                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary" />
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
