"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useSession } from 'next-auth/react'

interface ProgressContextType {
    completedLessons: number[]
    markLessonComplete: (id: number) => void
    isLessonComplete: (id: number) => boolean
    overallProgress: number
    resetProgress: () => void
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined)

export function ProgressProvider({ children }: { children: ReactNode }) {
    const { status } = useSession()
    const [completedLessons, setCompletedLessons] = useState<number[]>([])

    // Load from API on mount
    useEffect(() => {
        if (status !== 'authenticated') return // Don't fetch if not logged in

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

    const markLessonComplete = async (id: number) => {
        if (!completedLessons.includes(id)) {
            // Optimistic update
            const newProgress = [...completedLessons, id]
            setCompletedLessons(newProgress)

            // Sync with DB
            try {
                await fetch('/api/progress', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ lessonId: id })
                })
            } catch (e) {
                console.error("Failed to save progress", e)
                // revert if needed
            }
        }
    }

    const isLessonComplete = (id: number) => completedLessons.includes(id)

    const resetProgress = async () => {
        setCompletedLessons([])
        // Reset logic for API could be implemented if needed.
    }

    // Calculate percentage (Assuming 6 lessons total)
    const overallProgress = Math.round((completedLessons.length / 6) * 100)

    return (
        <ProgressContext.Provider value={{ completedLessons, markLessonComplete, isLessonComplete, overallProgress, resetProgress }}>
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
