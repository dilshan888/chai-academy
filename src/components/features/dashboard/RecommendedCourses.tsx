"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Clock, Zap, ChevronRight } from 'lucide-react'
import { useProgress } from '@/lib/ProgressContext'
import styles from './dashboard.module.css'

// Gradient palette for lesson cards
const GRADIENTS = [
    'linear-gradient(135deg, #7a1d38 0%, #9d2447 50%, #4a0e22 100%)',
    'linear-gradient(135deg, #374151 0%, #4b5563 50%, #1f2937 100%)',
    'linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #1e40af 100%)',
    'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 50%, #6d28d9 100%)',
    'linear-gradient(135deg, #b45309 0%, #d97706 50%, #92400e 100%)',
    'linear-gradient(135deg, #065f46 0%, #059669 50%, #047857 100%)',
]

interface DBLesson {
    id: string
    title: string
    slug: string
    description: string | null
    difficulty: string
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

export function RecommendedCourses() {
    const { isLessonComplete } = useProgress()
    const [nextLessons, setNextLessons] = useState<DBLesson[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchLessons() {
            try {
                const res = await fetch('/api/lessons')
                if (!res.ok) return
                const data: DBLesson[] = await res.json()

                // Only consider lessons that belong to a module (part of the curriculum)
                const curriculumLessons = data
                    .filter(l => l.moduleId)
                    .sort((a, b) => a.sortOrder - b.sortOrder)

                // Pick the first 2 incomplete lessons as recommendations
                const incomplete = curriculumLessons.filter(l => !isLessonComplete(l.id))
                setNextLessons(incomplete.slice(0, 2))
            } catch (e) {
                console.error("Failed to load recommended lessons", e)
            } finally {
                setLoading(false)
            }
        }
        fetchLessons()
    }, [isLessonComplete])

    // If everything is complete, show a congratulatory message
    if (!loading && nextLessons.length === 0) {
        return (
            <div className={styles.recommendedSection}>
                <div className={styles.recommendedHeader}>
                    <h2 className={styles.recommendedTitle}>Up Next</h2>
                    <Link href="/courses" className={styles.recommendedViewAll}>View all</Link>
                </div>
                <div className={styles.recommendedEmpty}>
                    <p>You have completed all available lessons. Check back soon for new content.</p>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.recommendedSection}>
            <div className={styles.recommendedHeader}>
                <h2 className={styles.recommendedTitle}>Up Next</h2>
                <Link href="/courses" className={styles.recommendedViewAll}>View all</Link>
            </div>
            <div className={styles.recommendedGrid}>
                {nextLessons.map((lesson, idx) => {
                    const gradient = GRADIENTS[idx % GRADIENTS.length]
                    const moduleName = lesson.module?.title || 'Lesson'
                    const difficulty = lesson.difficulty
                        ? lesson.difficulty.charAt(0).toUpperCase() + lesson.difficulty.slice(1)
                        : 'Beginner'

                    return (
                        <Link key={lesson.id} href={`/lesson/${lesson.id}`} className={styles.courseCardLink}>
                            <div className={styles.courseCard}>
                                <div
                                    className={styles.courseCardImage}
                                    style={{ background: gradient }}
                                >
                                    <span className={styles.courseCardBadge}>{moduleName}</span>
                                </div>
                                <div className={styles.courseCardBody}>
                                    <h3 className={styles.courseCardTitle}>{lesson.title}</h3>
                                    <p className={styles.courseCardDesc}>
                                        {lesson.description || `Continue your ${difficulty.toLowerCase()} learning journey.`}
                                    </p>
                                    <div className={styles.courseCardMeta}>
                                        <span className={styles.courseCardMetaItem}>
                                            <Clock size={13} />
                                            {difficulty}
                                        </span>
                                        <span className={styles.courseCardMetaItem}>
                                            <Zap size={13} />
                                            50 XP
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
