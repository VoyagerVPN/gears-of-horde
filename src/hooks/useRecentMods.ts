"use client"

import { useState, useEffect, useCallback } from "react"

const RECENT_MODS_KEY = "recent-mods-history"
const MAX_RECENT_MODS = 10

export interface RecentMod {
    slug: string
    title: string
    lastOpenedAt: string
}

export function useRecentMods() {
    const [recentMods, setRecentMods] = useState<RecentMod[]>([])

    const loadRecentMods = useCallback(() => {
        if (typeof window === "undefined") return
        try {
            const stored = localStorage.getItem(RECENT_MODS_KEY)
            if (stored) {
                const parsed: RecentMod[] = JSON.parse(stored)
                setRecentMods(parsed.sort((a, b) => new Date(b.lastOpenedAt).getTime() - new Date(a.lastOpenedAt).getTime()))
            }
        } catch (error) {
            console.error("Failed to load recent mods:", error)
        }
    }, [])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadRecentMods()
    }, [loadRecentMods])

    const addToRecent = useCallback((slug: string, title: string) => {
        if (typeof window === "undefined") return

        try {
            // Get current list
            const currentStored = localStorage.getItem(RECENT_MODS_KEY)
            let currentMods: RecentMod[] = currentStored ? JSON.parse(currentStored) : []

            // Remove existing entry for this slug if any
            currentMods = currentMods.filter(m => m.slug !== slug)

            // Add new entry to top
            currentMods.unshift({
                slug,
                title,
                lastOpenedAt: new Date().toISOString()
            })

            // Limit size
            const limitedMods = currentMods.slice(0, MAX_RECENT_MODS)

            localStorage.setItem(RECENT_MODS_KEY, JSON.stringify(limitedMods))
            setRecentMods(limitedMods)
        } catch (error) {
            console.error("Failed to update recent mods:", error)
        }
    }, [])

    return {
        recentMods,
        addToRecent,
        refreshRecent: loadRecentMods
    }
}
