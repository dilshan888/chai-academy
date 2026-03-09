"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BookOpen, Clock, ChevronRight, Star, Zap } from 'lucide-react'
import styles from './courses.module.css'

interface Course {
    id: string
    title: string
    slug: string
    description: string | null
    imageUrl: string | null
    duration: string | null
    xpReward: number
    moduleCount: number
    lessonCount: number
    completedLessons: number
    progress: number
}

const COURSE_GRADIENTS = [
    'linear-gradient(135deg, #7a1d38 0%, #9d2447 40%, #c2365c 100%)',
    'linear-gradient(135deg, #1e3a5f 0%, #2563eb 40%, #3b82f6 100%)',
    'linear-gradient(135deg, #065f46 0%, #059669 40%, #10b981 100%)',
    'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 40%, #a78bfa 100%)',
    'linear-gradient(135deg, #b45309 0%, #d97706 40%, #f59e0b 100%)',
]

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchCourses() {
            try {
                const res = await fetch('/api/courses')
                if (res.ok) {
                    const data = await res.json()
                    setCourses(data)
                }
            } catch (e) {
                console.error('Failed to fetch courses', e)
            } finally {
                setLoading(false)
            }
        }
        fetchCourses()
    }, [])

    const totalLessons = courses.reduce((sum, c) => sum + c.lessonCount, 0)
    const totalCompleted = courses.reduce((sum, c) => sum + c.completedLessons, 0)
    const overallProgress = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>My Courses</h1>
                        <p className={styles.subtitle}>Loading your learning journey…</p>
                    </div>
                </div>
                <div className={styles.courseGrid}>
                    {[1, 2].map(i => (
                        <div key={i} className={styles.skeletonCard}>
                            <div className={styles.skeletonBanner} />
                            <div className={styles.skeletonBody}>
                                <div className={styles.skeletonLine} style={{ width: '70%' }} />
                                <div className={styles.skeletonLine} style={{ width: '100%' }} />
                                <div className={styles.skeletonLine} style={{ width: '40%' }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>My Courses</h1>
                    <p className={styles.subtitle}>
                        Your AI compliance learning journey — {totalCompleted} of {totalLessons} lessons completed
                    </p>
                </div>
                <div className={styles.progressBadge}>
                    <span className={styles.progressBadgeValue}>{overallProgress}%</span>
                    <span className={styles.progressBadgeLabel}>Overall</span>
                </div>
            </div>

            {courses.length === 0 ? (
                <div className={styles.emptyState}>
                    <BookOpen size={48} />
                    <h2>No Courses Available</h2>
                    <p>Check back soon — new courses are being prepared.</p>
                </div>
            ) : (
                <div className={styles.courseGrid}>
                    {courses.map((course, idx) => (
                        <Link
                            key={course.id}
                            href={`/courses/${course.slug}`}
                            className={styles.courseCardLink}
                        >
                            <div className={styles.courseCard}>
                                {/* Gradient Header */}
                                <div
                                    className={styles.courseCardBanner}
                                    style={{ background: COURSE_GRADIENTS[idx % COURSE_GRADIENTS.length] }}
                                >
                                    <div className={styles.courseCardBannerContent}>
                                        <span className={styles.courseCardTag}>
                                            {course.moduleCount} {course.moduleCount === 1 ? 'Module' : 'Modules'}
                                        </span>
                                        {course.progress === 100 && (
                                            <span className={styles.courseCardCompleteBadge}>
                                                <Star size={12} />
                                                Complete
                                            </span>
                                        )}
                                    </div>
                                    <h2 className={styles.courseCardBannerTitle}>{course.title}</h2>
                                </div>

                                {/* Card Body */}
                                <div className={styles.courseCardBody}>
                                    {course.description && (
                                        <p className={styles.courseCardDescription}>{course.description}</p>
                                    )}

                                    {/* Meta: Duration, Lessons, XP */}
                                    <div className={styles.courseCardMeta}>
                                        {course.duration && (
                                            <span className={styles.courseCardMetaItem}>
                                                <Clock size={13} />
                                                {course.duration}
                                            </span>
                                        )}
                                        <span className={styles.courseCardMetaItem}>
                                            <BookOpen size={13} />
                                            {course.lessonCount} Lessons
                                        </span>
                                        <span className={styles.courseCardMetaItem}>
                                            <Zap size={13} />
                                            {course.xpReward} XP
                                        </span>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className={styles.courseProgressContainer}>
                                        <div className={styles.courseProgressHeader}>
                                            <span className={styles.courseProgressLabel}>
                                                {course.completedLessons}/{course.lessonCount} lessons
                                            </span>
                                            <span className={styles.courseProgressPercent}>{course.progress}%</span>
                                        </div>
                                        <div className={styles.courseProgressBar}>
                                            <div
                                                className={styles.courseProgressFill}
                                                style={{ width: `${course.progress}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Footer CTA */}
                                    <div className={styles.courseCardFooter}>
                                        <span className={styles.courseCardAction}>
                                            {course.progress === 0
                                                ? 'Start Course'
                                                : course.progress === 100
                                                    ? 'Review Course'
                                                    : 'Continue Learning'}
                                            <ChevronRight size={14} />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
