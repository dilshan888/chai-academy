"use client"

import { useState, useEffect } from 'react'
import { useProgress } from '@/lib/ProgressContext'
import { ProgressBar } from '@/components/ui/progress-bar'
import { Button } from '@/components/ui/button'
import styles from './dashboard.module.css'

const STATIC_LESSONS = [
    { id: '1', title: "What AI Is (and Is Not)" },
    { id: '2', title: "Where AI Appears in University Administration" },
    { id: '3', title: "Data, Privacy, and GDPR Basics" },
    { id: '4', title: "EU AI Act Overview for Admin Work" },
    { id: '5', title: "High Risk vs Low Risk AI Systems" },
    { id: '6', title: "Human Oversight and Responsibility" },
]

interface DBLesson {
    id: string
    title: string
    slug: string
}

export function LearningProgressCard() {
    const { overallProgress, isLessonComplete } = useProgress()
    const [allLessons, setAllLessons] = useState(STATIC_LESSONS)

    useEffect(() => {
        async function fetchDBLessons() {
            try {
                const res = await fetch('/api/lessons')
                if (res.ok) {
                    const data: DBLesson[] = await res.json()
                    const dbEntries = data.map((l) => ({ id: l.id, title: l.title }))
                    setAllLessons([...STATIC_LESSONS, ...dbEntries])
                }
            } catch (e) {
                // Keep static lessons as fallback
            }
        }
        fetchDBLessons()
    }, [])

    // Find next incomplete lesson
    const nextLesson = allLessons.find(l => !isLessonComplete(l.id))
    const currentLessonId = nextLesson?.id ?? null
    // DB lessons use /lessons/[id], static use /lesson/[id]
    const isDBLesson = currentLessonId && !STATIC_LESSONS.some(l => l.id === currentLessonId)
    const lessonHref = currentLessonId
        ? isDBLesson ? `/lessons/${currentLessonId}` : `/lesson/${currentLessonId}`
        : '#'

    return (
        <div className={styles.progressCard}>
            <h2 className={styles.progressCardTitle}>Learning Progress</h2>

            <div className={styles.progressCardTrack}>
                Foundation Track
            </div>
            <div className={styles.progressCardNext}>
                {nextLesson
                    ? `Next: ${nextLesson.title}`
                    : 'All lessons complete!'
                }
            </div>

            <div className={styles.progressCardStats}>
                <span style={{ fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))' }}>
                    Progress
                </span>
                <span className={styles.progressPercent}>{overallProgress}%</span>
            </div>

            <ProgressBar progress={overallProgress} />

            <div className={styles.progressCardFooter}>
                {currentLessonId ? (
                    <a href={lessonHref}>
                        <Button variant="primary">Resume Learning</Button>
                    </a>
                ) : (
                    <Button variant="secondary" disabled>Course Complete</Button>
                )}
            </div>
        </div>
    )
}
