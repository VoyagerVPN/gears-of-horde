"use server"

import { db } from "@/lib/db"
import { subDays, startOfDay, format } from "date-fns"

export async function fetchAdminStats() {
    const [userCount, modCount, newsCount, pendingSubmissions, downloadCount] = await Promise.all([
        db.user.count(),
        db.mod.count(),
        db.news.count(),
        db.modSubmission.count({ where: { status: 'pending' } }),
        db.downloadHistory.count()
    ])

    return {
        userCount,
        modCount,
        newsCount,
        pendingSubmissions,
        downloadCount
    }
}

export async function fetchActivityStats(days = 30) {
    const startDate = subDays(startOfDay(new Date()), days)

    // Fetch user registrations over time
    const userRegistrations = await db.user.findMany({
        where: {
            createdAt: {
                gte: startDate
            }
        },
        select: {
            createdAt: true
        },
        orderBy: {
            createdAt: 'asc'
        }
    })

    // Fetch view history over time
    const viewHistory = await db.viewHistory.findMany({
        where: {
            viewedAt: {
                gte: startDate
            }
        },
        select: {
            viewedAt: true
        }
    })

    // Fetch anonymous views over time
    const anonymousViews = await db.anonymousView.findMany({
        where: {
            viewedAt: {
                gte: startDate
            }
        },
        select: {
            viewedAt: true
        }
    })

    // Process data for charts
    const chartDataMap = new Map()

    // Initialize map with last 30 days
    for (let i = 0; i < days; i++) {
        const dateStr = format(subDays(new Date(), i), 'yyyy-MM-dd')
        chartDataMap.set(dateStr, { date: dateStr, registrations: 0, views: 0 })
    }

    userRegistrations.forEach(user => {
        const dateStr = format(user.createdAt, 'yyyy-MM-dd')
        const current = chartDataMap.get(dateStr) || { date: dateStr, registrations: 0, views: 0 }
        current.registrations++
        chartDataMap.set(dateStr, current)
    })

    const processViews = (v: { viewedAt: Date }) => {
        const dateStr = format(v.viewedAt, 'yyyy-MM-dd')
        const current = chartDataMap.get(dateStr) || { date: dateStr, registrations: 0, views: 0 }
        current.views++
        chartDataMap.set(dateStr, current)
    }

    viewHistory.forEach(processViews)
    anonymousViews.forEach(processViews)

    return Array.from(chartDataMap.values()).sort((a, b) => a.date.localeCompare(b.date))
}
