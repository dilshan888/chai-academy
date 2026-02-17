"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BookOpen, CheckCircle, ChevronRight, Clock, Layers } from 'lucide-react'
import { LESSONS } from '@/data/lessons'
import { useProgress } from '@/lib/ProgressContext'
import styles from './courses.module.css'

const LESSON_META: Record<string, { duration: string; gradient: string }> = {
    "1": { duration: "15 mins", gradient: "linear-gradient(135deg, #7a1d38 0%, #9d2447 50%, #4a0e22 100%)" },
    "2": { duration: "15 mins", gradient: "linear-gradient(135deg, #374151 0%, #4b5563 50%, #1f2937 100%)" },
    "3": { duration: "20 mins", gradient: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #1e40af 100%)" },
    "4": { duration: "20 mins", gradient: "linear-gradient(135deg, #7c3aed 0%, #8b5cf6 50%, #6d28d9 100%)" },
    "5": { duration: "15 mins", gradient: "linear-gradient(135deg, #b45309 0%, #d97706 50%, #92400e 100%)" },
    "6": { duration: "15 mins", gradient: "linear-gradient(135deg, #065f46 0%, #059669 50%, #047857 100%)" },
}

// Gradient palette for dynamically-created lessons
const DYNAMIC_GRADIENTS = [
    "linear-gradient(135deg, #0f766e 0%, #14b8a6 50%, #0d9488 100%)",
    "linear-gradient(135deg, #7e22ce 0%, #a855f7 50%, #9333ea 100%)",
    "linear-gradient(135deg, #be123c 0%, #f43f5e 50%, #e11d48 100%)",
    "linear-gradient(135deg, #1d4ed8 0%, #3b82f6 50%, #2563eb 100%)",
    "linear-gradient(135deg, #a16207 0%, #eab308 50%, #ca8a04 100%)",
    "linear-gradient(135deg, #15803d 0%, #22c55e 50%, #16a34a 100%)",
]

interface DBLesson {
    id: string
    title: string
    slug: string
    description: string | null
    difficulty: string
    createdAt: string
    updatedAt: string
}

export default function CoursesPage() {
    const { completedLessons, isLessonComplete } = useProgress()
    const [dbLessons, setDbLessons] = useState<DBLesson[]>([])

    useEffect(() => {
        async function fetchLessons() {
            try {
                const res = await fetch('/api/lessons')
                if (res.ok) {
                    const data = await res.json()
                    setDbLessons(data)
                }
            } catch (e) {
                console.error("Failed to fetch lessons from DB", e)
            }
        }
        fetchLessons()
    }, [])

    // Static lessons from data file
    const staticLessons = Object.entries(LESSONS).sort(([, a], [, b]) => a.id - b.id)

    // Total count = static + DB lessons
    const totalCount = staticLessons.length + dbLessons.length
    const completedCount = completedLessons.length

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>My Courses</h1>
                    <p className={styles.subtitle}>
                        Your AI compliance learning journey — {completedCount} of {totalCount} lessons completed
                    </p>
                </div>
                <div className={styles.progressBadge}>
                    <span className={styles.progressBadgeValue}>{totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%</span>
                    <span className={styles.progressBadgeLabel}>Complete</span>
                </div>
            </div>

            <div className={styles.grid}>
                {/* Render static (hardcoded) lessons */}
                {staticLessons.map(([key, lesson]) => {
                    const meta = LESSON_META[key] || { duration: "15 mins", gradient: "linear-gradient(135deg, #374151, #4b5563)" }
                    const completed = isLessonComplete(key)

                    return (
                        <Link key={key} href={`/lesson/${key}`} className={styles.cardLink}>
                            <div className={`${styles.card} ${completed ? styles.cardCompleted : ''}`}>
                                <div className={styles.cardBanner} style={{ background: meta.gradient }}>
                                    <span className={styles.cardNumber}>Lesson {lesson.id}</span>
                                    {completed && (
                                        <span className={styles.cardCompletedBadge}>
                                            <CheckCircle size={14} />
                                            Completed
                                        </span>
                                    )}
                                </div>
                                <div className={styles.cardBody}>
                                    <h3 className={styles.cardTitle}>{lesson.title}</h3>
                                    <div className={styles.cardMeta}>
                                        <span className={styles.cardMetaItem}>
                                            <Layers size={13} />
                                            {lesson.sections.length} sections
                                        </span>
                                        <span className={styles.cardMetaItem}>
                                            <Clock size={13} />
                                            {meta.duration}
                                        </span>
                                    </div>
                                    <div className={styles.cardFooter}>
                                        <span className={styles.cardAction}>
                                            {completed ? 'Review Lesson' : 'Start Lesson'}
                                            <ChevronRight size={14} />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    )
                })}

                {/* Render DB-created lessons */}
                {dbLessons.map((lesson, idx) => {
                    const gradient = DYNAMIC_GRADIENTS[idx % DYNAMIC_GRADIENTS.length]
                    const completed = isLessonComplete(lesson.id)

                    return (
                        <Link key={lesson.id} href={`/lessons/${lesson.id}`} className={styles.cardLink}>
                            <div className={`${styles.card} ${completed ? styles.cardCompleted : ''}`}>
                                <div className={styles.cardBanner} style={{ background: gradient }}>
                                    <span className={styles.cardNumber}>{lesson.difficulty}</span>
                                    {completed && (
                                        <span className={styles.cardCompletedBadge}>
                                            <CheckCircle size={14} />
                                            Completed
                                        </span>
                                    )}
                                </div>
                                <div className={styles.cardBody}>
                                    <h3 className={styles.cardTitle}>{lesson.title}</h3>
                                    {lesson.description && (
                                        <p style={{ fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))', margin: '0.25rem 0 0.5rem' }}>
                                            {lesson.description}
                                        </p>
                                    )}
                                    <div className={styles.cardMeta}>
                                        <span className={styles.cardMetaItem}>
                                            <BookOpen size={13} />
                                            {lesson.slug}
                                        </span>
                                    </div>
                                    <div className={styles.cardFooter}>
                                        <span className={styles.cardAction}>
                                            {completed ? 'Review Lesson' : 'Start Lesson'}
                                            <ChevronRight size={14} />
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
