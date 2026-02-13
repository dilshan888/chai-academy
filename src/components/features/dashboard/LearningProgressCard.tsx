"use client"

import { useProgress } from '@/lib/ProgressContext'
import { ProgressBar } from '@/components/ui/progress-bar'
import { Button } from '@/components/ui/button'
import styles from './dashboard.module.css'

const TRACK_LESSONS = [
    { id: '1', title: "What AI Is (and Is Not)" },
    { id: '2', title: "Where AI Appears in University Administration" },
    { id: '3', title: "Data, Privacy, and GDPR Basics" },
    { id: '4', title: "EU AI Act Overview for Admin Work" },
    { id: '5', title: "High Risk vs Low Risk AI Systems" },
    { id: '6', title: "Human Oversight and Responsibility" },
]

export function LearningProgressCard() {
    const { overallProgress, isLessonComplete } = useProgress()

    // Find next lesson
    const nextLesson = TRACK_LESSONS.find(l => !isLessonComplete(l.id))
    const currentLessonId = nextLesson?.id ?? null

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
                    <a href={`/lesson/${currentLessonId}`}>
                        <Button variant="primary">Resume Learning</Button>
                    </a>
                ) : (
                    <Button variant="secondary" disabled>Course Complete</Button>
                )}
            </div>
        </div>
    )
}
