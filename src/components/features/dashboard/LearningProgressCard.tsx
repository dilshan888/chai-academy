"use client"

import { useState, useEffect } from 'react'
import { useProgress } from '@/lib/ProgressContext'
import { ProgressBar } from '@/components/ui/progress-bar'
import { Button } from '@/components/ui/button'
import styles from './dashboard.module.css'

interface DBLesson {
    id: string
    title: string
    slug: string
    sortOrder: number
    moduleId: string | null
    module?: {
        id: string
        title: string
        phase?: {
            id: string
            title: string
        } | null
    } | null
}

export function LearningProgressCard() {
    const { overallProgress, isLessonComplete } = useProgress()
    const [allLessons, setAllLessons] = useState<DBLesson[]>([])

    useEffect(() => {
        async function fetchDBLessons() {
            try {
                const res = await fetch('/api/lessons')
                if (res.ok) {
                    const data: DBLesson[] = await res.json()
                    setAllLessons(data)
                }
            } catch (e) {
                // Fail gracefully
            }
        }
        fetchDBLessons()
    }, [])

    // Only consider curriculum lessons (those assigned to a module)
    const curriculumLessons = allLessons
        .filter(l => l.moduleId)
        .sort((a, b) => a.sortOrder - b.sortOrder)

    // Find next incomplete lesson in the curriculum
    const nextLesson = curriculumLessons.find(l => !isLessonComplete(l.id))
    const currentLessonId = nextLesson?.id ?? null
    const lessonHref = currentLessonId ? `/lesson/${currentLessonId}` : '#'

    // Determine the current phase from the next lesson
    const currentPhase = nextLesson?.module?.phase?.title || null
    const currentModule = nextLesson?.module?.title || null

    // Calculate curriculum-only progress
    const curriculumCompleted = curriculumLessons.filter(l => isLessonComplete(l.id)).length
    const curriculumTotal = curriculumLessons.length
    const curriculumProgress = curriculumTotal > 0
        ? Math.round((curriculumCompleted / curriculumTotal) * 100)
        : overallProgress

    return (
        <div className={styles.progressCard}>
            <h2 className={styles.progressCardTitle}>Learning Progress</h2>

            <div className={styles.progressCardTrack}>
                {currentPhase || 'AI Compliance Training'}
            </div>
            <div className={styles.progressCardNext}>
                {nextLesson
                    ? `Next: ${nextLesson.title}`
                    : 'All lessons complete!'
                }
            </div>

            <div className={styles.progressCardStats}>
                <span style={{ fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))' }}>
                    {curriculumCompleted} of {curriculumTotal} lessons
                </span>
                <span className={styles.progressPercent}>{curriculumProgress}%</span>
            </div>

            <ProgressBar progress={curriculumProgress} />

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
