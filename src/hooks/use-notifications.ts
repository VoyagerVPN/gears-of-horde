"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/utils/supabase/client"
import { useSupabaseAuth } from "@/components/SupabaseAuthProvider"

export interface Notification {
    id: string
    userId: string
    type: 'MOD_UPDATE' | 'COMMENT_REPLY' | 'SYSTEM_ANNOUNCEMENT'
    title: string
    message: string
    link: string | null
    isRead: boolean
    createdAt: string
}

export function useNotifications() {
    const { user } = useSupabaseAuth()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const supabase = createClient()

    const fetchNotifications = useCallback(async () => {
        if (!user) return

        setIsLoading(true)
        const { data, error } = await supabase
            .from('Notification')
            .select('*')
            .eq('userId', user.id)
            .order('createdAt', { ascending: false })
            .limit(50)

        if (!error && data) {
            setNotifications(data as Notification[])
            setUnreadCount(data.filter(n => !n.isRead).length)
        }
        setIsLoading(false)
    }, [user, supabase])

    useEffect(() => {
        if (!user) return

        fetchNotifications()

        // Set up realtime subscription
        const channel = supabase
            .channel(`notifications:${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'Notification',
                    filter: `userId=eq.${user.id}`
                },
                (payload) => {
                    const newNotification = payload.new as Notification
                    setNotifications(prev => [newNotification, ...prev])
                    setUnreadCount(prev => prev + 1)
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'Notification',
                    filter: `userId=eq.${user.id}`
                },
                (payload) => {
                    const updatedNotification = payload.new as Notification
                    setNotifications(prev => 
                        prev.map(n => n.id === updatedNotification.id ? updatedNotification : n)
                    )
                    // Recalculate unread count
                    setUnreadCount(prev => {
                        const old = notifications.find(n => n.id === updatedNotification.id)
                        if (old?.isRead === updatedNotification.isRead) return prev
                        return updatedNotification.isRead ? prev - 1 : prev + 1
                    })
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [user, supabase, fetchNotifications, notifications])

    const markAsRead = async (id: string) => {
        const { error } = await supabase
            .from('Notification')
            .update({ isRead: true })
            .eq('id', id)

        if (!error) {
            setNotifications(prev => 
                prev.map(n => n.id === id ? { ...n, isRead: true } : n)
            )
            setUnreadCount(prev => Math.max(0, prev - 1))
        }
    }

    const markAllAsRead = async () => {
        if (!user) return

        const { error } = await supabase
            .from('Notification')
            .update({ isRead: true })
            .eq('userId', user.id)
            .eq('isRead', false)

        if (!error) {
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
            setUnreadCount(0)
        }
    }

    return {
        notifications,
        unreadCount,
        isLoading,
        markAsRead,
        markAllAsRead,
        refresh: fetchNotifications
    }
}
