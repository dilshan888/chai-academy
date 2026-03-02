"use client"

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { ArrowLeft, BookOpen, CheckCircle, ChevronDown, Clock, Layers, Zap, Gamepad2 } from 'lucide-react'
import styles from '../courses.module.css'

interface LessonInfo {
    id: string
    title: string
    slug: string
    description: string | null
    difficulty: string
    completed: boolean
    hasScenario: boolean
}

interface ModuleInfo {
    id: string
    title: string
    slug: string
    description: string | null
    lessonCount: number
    completedLessons: number
    progress: number
    lessons: LessonInfo[]
}

interface CourseDetail {
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
    modules: ModuleInfo[]
}

const COURSE_GRADIENTS = [
    'linear-gradient(135deg, #7a1d38 0%, #9d2447 40%, #c2365c 100%)',
    'linear-gradient(135deg, #1e3a5f 0%, #2563eb 40%, #3b82f6 100%)',
    'linear-gradient(135deg, #065f46 0%, #059669 40%, #10b981 100%)',
    'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 40%, #a78bfa 100%)',
    'linear-gradient(135deg, #b45309 0%, #d97706 40%, #f59e0b 100%)',
]

const DIFFICULTY_COLORS: Record<string, string> = {
    beginner: '#10b981',
    intermediate: '#f59e0b',
    advanced: '#ef4444',
}

export default function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params)
    const [course, setCourse] = useState<CourseDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())

    useEffect(() => {
        async function fetchCourse() {
            try {
                const res = await fetch(`/api/courses/${slug}`)
                if (res.ok) {
                    const data = await res.json()
                    setCourse(data)
                    // Expand all modules by default
                    setExpandedModules(new Set(data.modules.map((m: ModuleInfo) => m.id)))
                }
            } catch (e) {
                console.error('Failed to fetch course', e)
            } finally {
                setLoading(false)
            }
        }
        fetchCourse()
    }, [slug])

    const toggleModule = (moduleId: string) => {
        setExpandedModules(prev => {
            const next = new Set(prev)
            if (next.has(moduleId)) {
                next.delete(moduleId)
            } else {
                next.add(moduleId)
            }
            return next
        })
    }

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.skeletonCard} style={{ height: '200px' }}>
                    <div className={styles.skeletonBanner} style={{ height: '100%' }} />
                </div>
                {[1, 2].map(i => (
                    <div key={i} className={styles.skeletonCard} style={{ marginTop: '1rem' }}>
                        <div className={styles.skeletonBody}>
                            <div className={styles.skeletonLine} style={{ width: '60%' }} />
                            <div className={styles.skeletonLine} style={{ width: '100%' }} />
                            <div className={styles.skeletonLine} style={{ width: '80%' }} />
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    if (!course) {
        return (
            <div className={styles.container}>
                <div className={styles.emptyState}>
                    <BookOpen size={48} />
                    <h2>Course Not Found</h2>
                    <p>This course doesn't exist or has been unpublished.</p>
                    <Link href="/courses" className={styles.backLink}>
                        <ArrowLeft size={16} /> Back to Courses
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.container}>
            {/* Back Link */}
            <Link href="/courses" className={styles.backLink}>
                <ArrowLeft size={16} /> All Courses
            </Link>

            {/* Course Header */}
            <div
                className={styles.courseDetailHeader}
                style={{ background: COURSE_GRADIENTS[0] }}
            >
                <div className={styles.courseDetailHeaderContent}>
                    <h1 className={styles.courseDetailTitle}>{course.title}</h1>
                    {course.description && (
                        <p className={styles.courseDetailDescription}>{course.description}</p>
                    )}
                    <div className={styles.courseDetailMeta}>
                        {course.duration && (
                            <span className={styles.courseDetailMetaItem}>
                                <Clock size={14} /> {course.duration}
                            </span>
                        )}
                        <span className={styles.courseDetailMetaItem}>
                            <Layers size={14} /> {course.moduleCount} Modules
                        </span>
                        <span className={styles.courseDetailMetaItem}>
                            <BookOpen size={14} /> {course.lessonCount} Lessons
                        </span>
                        <span className={styles.courseDetailMetaItem}>
                            <Zap size={14} /> {course.xpReward} XP
                        </span>
                    </div>
                </div>
                {/* Progress circle */}
                <div className={styles.courseDetailProgress}>
                    <svg viewBox="0 0 100 100" className={styles.progressCircle}>
                        <circle cx="50" cy="50" r="42" className={styles.progressCircleTrack} />
                        <circle
                            cx="50" cy="50" r="42"
                            className={styles.progressCircleFill}
                            strokeDasharray={`${course.progress * 2.64} 264`}
                        />
                    </svg>
                    <div className={styles.progressCircleText}>
                        <span className={styles.progressCircleValue}>{course.progress}%</span>
                        <span className={styles.progressCircleLabel}>Complete</span>
                    </div>
                </div>
            </div>

            {/* Module Accordions */}
            <div className={styles.moduleList}>
                {course.modules.map((mod, idx) => {
                    const isOpen = expandedModules.has(mod.id)

                    return (
                        <div key={mod.id} className={styles.moduleAccordion}>
                            <button
                                className={styles.moduleAccordionHeader}
                                onClick={() => toggleModule(mod.id)}
                                type="button"
                            >
                                <div className={styles.moduleAccordionLeft}>
                                    <ChevronDown
                                        size={18}
                                        className={`${styles.moduleChevron} ${isOpen ? styles.moduleChevronOpen : ''}`}
                                    />
                                    <div>
                                        <h3 className={styles.moduleAccordionTitle}>
                                            {mod.title}
                                        </h3>
                                        {mod.description && (
                                            <p className={styles.moduleAccordionDesc}>{mod.description}</p>
                                        )}
                                    </div>
                                </div>
                                <div className={styles.moduleAccordionRight}>
                                    <span className={styles.moduleProgressPill}>
                                        {mod.completedLessons}/{mod.lessonCount}
                                    </span>
                                </div>
                            </button>

                            {isOpen && (
                                <div className={styles.moduleAccordionBody}>
                                    {/* Module progress bar */}
                                    <div className={styles.moduleProgressBarContainer}>
                                        <div className={styles.courseProgressBar}>
                                            <div
                                                className={styles.courseProgressFill}
                                                style={{ width: `${mod.progress}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Lesson list */}
                                    <ul className={styles.lessonList}>
                                        {mod.lessons.map((lesson, lessonIdx) => (
                                            <li key={lesson.id} className={styles.lessonRow}>
                                                <Link
                                                    href={`/lesson/${lesson.id}`}
                                                    className={`${styles.lessonRowLink} ${lesson.completed ? styles.lessonRowCompleted : ''}`}
                                                >
                                                    <div className={styles.lessonRowLeft}>
                                                        <span className={`${styles.lessonRowNumber} ${lesson.completed ? styles.lessonRowNumberDone : ''}`}>
                                                            {lesson.completed ? (
                                                                <CheckCircle size={18} />
                                                            ) : (
                                                                <span>{lessonIdx + 1}</span>
                                                            )}
                                                        </span>
                                                        <div>
                                                            <span className={styles.lessonRowTitle}>{lesson.title}</span>
                                                            {lesson.description && (
                                                                <span className={styles.lessonRowDesc}>{lesson.description}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className={styles.lessonRowRight}>
                                                        {lesson.hasScenario && (
                                                            <span className={styles.lessonBadge} title="Has interactive scenario">
                                                                <Gamepad2 size={12} /> Scenario
                                                            </span>
                                                        )}
                                                        <span
                                                            className={styles.difficultyBadge}
                                                            style={{
                                                                color: DIFFICULTY_COLORS[lesson.difficulty] || '#6b7280',
                                                                background: `${DIFFICULTY_COLORS[lesson.difficulty] || '#6b7280'}15`,
                                                            }}
                                                        >
                                                            {lesson.difficulty}
                                                        </span>
                                                    </div>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
