"use client"

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

export default function CoursesPage() {
    const { completedLessons, isLessonComplete } = useProgress()
    const lessonList = Object.entries(LESSONS).sort(([, a], [, b]) => a.id - b.id)
    const completedCount = completedLessons.length
    const totalCount = lessonList.length

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
                    <span className={styles.progressBadgeValue}>{Math.round((completedCount / totalCount) * 100)}%</span>
                    <span className={styles.progressBadgeLabel}>Complete</span>
                </div>
            </div>

            <div className={styles.grid}>
                {lessonList.map(([key, lesson]) => {
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
            </div>
        </div>
    )
}
