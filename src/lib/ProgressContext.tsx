"use client"

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useSession } from 'next-auth/react'

interface GamificationStats {
    totalXP: number
    level: number
    levelTitle: string
    nextLevelXP: number | null
    currentStreak: number
    longestStreak: number
    streakMultiplier: number
    todayXP: number
    badgeCount: number
}

interface XPNotification {
    id: string
    amount: number
    reason: string
}

interface ProgressContextType {
    completedLessons: string[]
    markLessonComplete: (id: string, score?: number) => Promise<void>
    isLessonComplete: (id: string) => boolean
    overallProgress: number
    resetProgress: () => void
    stats: GamificationStats
    xpNotifications: XPNotification[]
    dismissXPNotification: (id: string) => void
    refreshStats: () => Promise<void>
}

const DEFAULT_STATS: GamificationStats = {
    totalXP: 0,
    level: 1,
    levelTitle: 'Novice',
    nextLevelXP: 100,
    currentStreak: 0,
    longestStreak: 0,
    streakMultiplier: 1.0,
    todayXP: 0,
    badgeCount: 0,
}

const TOTAL_LESSONS = 6

const ProgressContext = createContext<ProgressContextType | undefined>(undefined)

export function ProgressProvider({ children }: { children: ReactNode }) {
    const { status } = useSession()
    const [completedLessons, setCompletedLessons] = useState<string[]>([])
    const [stats, setStats] = useState<GamificationStats>(DEFAULT_STATS)
    const [xpNotifications, setXpNotifications] = useState<XPNotification[]>([])

    // Load progress from API
    useEffect(() => {
        if (status !== 'authenticated') return

        async function loadProgress() {
            try {
                const res = await fetch('/api/progress')
                if (res.ok) {
                    const data = await res.json()
                    setCompletedLessons(data.completedLessons || [])
                }
            } catch (e) {
                console.error("Failed to load progress", e)
            }
        }
        loadProgress()
    }, [status])

    // Load gamification stats
    const refreshStats = useCallback(async () => {
        if (status !== 'authenticated') return
        try {
            const res = await fetch('/api/gamification/stats')
            if (res.ok) {
                const data = await res.json()
                setStats({
                    totalXP: data.totalXP ?? 0,
                    level: data.level ?? 1,
                    levelTitle: data.levelTitle ?? 'Novice',
                    nextLevelXP: data.nextLevelXP,
                    currentStreak: data.currentStreak ?? 0,
                    longestStreak: data.longestStreak ?? 0,
                    streakMultiplier: data.streakMultiplier ?? 1.0,
                    todayXP: data.todayXP ?? 0,
                    badgeCount: data.badgeCount ?? 0,
                })
            }
        } catch (e) {
            console.error("Failed to load gamification stats", e)
        }
    }, [status])

    useEffect(() => {
        refreshStats()
    }, [refreshStats])

    const markLessonComplete = async (id: string, score?: number) => {
        if (!completedLessons.includes(id)) {
            // Optimistic update
            const newProgress = [...completedLessons, id]
            setCompletedLessons(newProgress)

            try {
                const res = await fetch('/api/progress', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ lessonId: id, score })
                })

                if (res.ok) {
                    const data = await res.json()

                    // Update stats from response
                    if (data.stats) {
                        setStats({
                            totalXP: data.stats.totalXP ?? 0,
                            level: data.stats.level ?? 1,
                            levelTitle: data.stats.levelTitle ?? 'Novice',
                            nextLevelXP: data.stats.nextLevelXP,
                            currentStreak: data.stats.currentStreak ?? 0,
                            longestStreak: data.stats.longestStreak ?? 0,
                            streakMultiplier: data.stats.streakMultiplier ?? 1.0,
                            todayXP: data.stats.todayXP ?? 0,
                            badgeCount: data.stats.badgeCount ?? 0,
                        })
                    }

                    // Show XP notification
                    if (data.xpGained > 0) {
                        const notifId = `xp-${Date.now()}`
                        setXpNotifications((prev) => [
                            ...prev,
                            { id: notifId, amount: data.xpGained, reason: 'Lesson Complete' },
                        ])
                    }

                    // Show badge notifications
                    if (data.newBadges?.length > 0) {
                        for (const badge of data.newBadges) {
                            const notifId = `badge-${Date.now()}-${badge.slug}`
                            setXpNotifications((prev) => [
                                ...prev,
                                { id: notifId, amount: badge.xpReward, reason: badge.title },
                            ])
                        }
                    }
                }
            } catch (e) {
                console.error("Failed to save progress", e)
            }
        }
    }

    const isLessonComplete = (id: string) => completedLessons.includes(id)

    const resetProgress = () => {
        setCompletedLessons([])
        setStats(DEFAULT_STATS)
    }

    const overallProgress = Math.round((completedLessons.length / TOTAL_LESSONS) * 100)

    const dismissXPNotification = (id: string) => {
        setXpNotifications((prev) => prev.filter((n) => n.id !== id))
    }

    return (
        <ProgressContext.Provider value={{
            completedLessons,
            markLessonComplete,
            isLessonComplete,
            overallProgress,
            resetProgress,
            stats,
            xpNotifications,
            dismissXPNotification,
            refreshStats,
        }}>
            {children}
        </ProgressContext.Provider>
    )
}

export function useProgress() {
    const context = useContext(ProgressContext)
    if (context === undefined) {
        throw new Error('useProgress must be used within a ProgressProvider')
    }
    return context
}
