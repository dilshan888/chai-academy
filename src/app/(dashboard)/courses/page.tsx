"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BookOpen, CheckCircle, ChevronDown, ChevronRight, Clock, Layers } from 'lucide-react'
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
    sortOrder: number
    moduleId: string | null
    createdAt: string
    updatedAt: string
    module?: {
        id: string
        title: string
        phase?: {
            id: string
            title: string
        } | null
    } | null
}

interface Phase {
    id: string
    title: string
    slug: string
    description: string | null
    sortOrder: number
    _count: {
        modules: number
    }
}

export default function CoursesPage() {
    const { completedLessons, isLessonComplete } = useProgress()
    const [dbLessons, setDbLessons] = useState<DBLesson[]>([])
    const [phases, setPhases] = useState<Phase[]>([])
    const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set())

    useEffect(() => {
        async function fetchData() {
            try {
                const [lessonsRes, phasesRes] = await Promise.all([
                    fetch('/api/lessons'),
                    fetch('/api/phases'),
                ])

                if (lessonsRes.ok) {
                    const lessonsData = await lessonsRes.json()
                    setDbLessons(lessonsData.sort((a: DBLesson, b: DBLesson) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)))
                }

                if (phasesRes.ok) {
                    const phasesData = await phasesRes.json()
                    const sorted = phasesData.sort((a: Phase, b: Phase) => a.sortOrder - b.sortOrder)
                    setPhases(sorted)
                    // Expand all phases by default
                    setExpandedPhases(new Set(sorted.map((p: Phase) => p.id)))
                }
            } catch (e) {
                console.error("Failed to fetch data", e)
            }
        }
        fetchData()
    }, [])

    const totalCount = dbLessons.length
    const completedCount = completedLessons.length

    const togglePhase = (phaseId: string) => {
        setExpandedPhases(prev => {
            const next = new Set(prev)
            if (next.has(phaseId)) {
                next.delete(phaseId)
            } else {
                next.add(phaseId)
            }
            return next
        })
    }

    // Group lessons by phase and module
    const lessonsByPhaseAndModule = () => {
        const grouped: Record<string, Record<string, DBLesson[]>> = {}
        const unassigned: DBLesson[] = []

        for (const lesson of dbLessons) {
            if (!lesson.moduleId || !lesson.module) {
                unassigned.push(lesson)
                continue
            }

            const phaseId = lesson.module.phase?.id || '_no_phase'
            const moduleId = lesson.module.id

            if (!grouped[phaseId]) grouped[phaseId] = {}
            if (!grouped[phaseId][moduleId]) grouped[phaseId][moduleId] = []
            grouped[phaseId][moduleId].push(lesson)
        }

        return { grouped, unassigned }
    }

    const { grouped, unassigned } = lessonsByPhaseAndModule()

    // Get module title from any lesson that belongs to it
    const getModuleTitle = (moduleId: string): string => {
        const lesson = dbLessons.find(l => l.module?.id === moduleId)
        return lesson?.module?.title || 'Module'
    }

    // Calculate phase progress
    const getPhaseProgress = (phaseId: string): { completed: number; total: number } => {
        const modules = grouped[phaseId]
        if (!modules) return { completed: 0, total: 0 }
        let total = 0
        let completed = 0
        for (const lessons of Object.values(modules)) {
            for (const lesson of lessons) {
                total++
                if (isLessonComplete(lesson.id)) completed++
            }
        }
        return { completed, total }
    }

    const renderLessonCard = (lesson: DBLesson, idx: number) => {
        const meta = LESSON_META[lesson.id] || {
            duration: "15 mins",
            gradient: DYNAMIC_GRADIENTS[idx % DYNAMIC_GRADIENTS.length]
        }
        const completed = isLessonComplete(lesson.id)

        return (
            <Link key={lesson.id} href={`/lesson/${lesson.id}`} className={styles.cardLink}>
                <div className={`${styles.card} ${completed ? styles.cardCompleted : ''}`}>
                    <div className={styles.cardBanner} style={{ background: meta.gradient }}>
                        <span className={styles.cardNumber}>
                            {parseInt(lesson.id) <= 6 ? `Lesson ${lesson.id}` : lesson.difficulty}
                        </span>
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
                                <Layers size={13} />
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
    }

    // If no phases exist, fall back to flat grid (backward compatible)
    const hasPhases = phases.length > 0

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

            {hasPhases ? (
                <>
                    {phases.map(phase => {
                        const isOpen = expandedPhases.has(phase.id)
                        const modules = grouped[phase.id]
                        const { completed: phaseCompleted, total: phaseTotal } = getPhaseProgress(phase.id)
                        const hasLessons = modules && Object.keys(modules).length > 0

                        return (
                            <div key={phase.id} className={styles.phaseSection}>
                                <button
                                    className={`${styles.phaseHeader} ${isOpen ? styles.accordionOpen : styles.accordion}`}
                                    onClick={() => togglePhase(phase.id)}
                                    type="button"
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                                        <ChevronDown
                                            size={18}
                                            style={{
                                                transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                                                transition: 'transform 0.2s',
                                                flexShrink: 0,
                                            }}
                                        />
                                        <div style={{ flex: 1 }}>
                                            <h2 className={styles.phaseTitle}>{phase.title}</h2>
                                            {phase.description && (
                                                <p className={styles.phaseDescription}>{phase.description}</p>
                                            )}
                                        </div>
                                    </div>
                                    {phaseTotal > 0 && (
                                        <div className={styles.phaseProgress}>
                                            {phaseCompleted}/{phaseTotal} completed
                                        </div>
                                    )}
                                </button>

                                {isOpen && hasLessons && (
                                    <div style={{ padding: '0 0 1rem 0' }}>
                                        {Object.entries(modules).map(([moduleId, lessons]) => (
                                            <div key={moduleId} className={styles.moduleSection}>
                                                <div className={styles.moduleHeader}>
                                                    <BookOpen size={16} />
                                                    <h3 className={styles.moduleTitle}>
                                                        {getModuleTitle(moduleId)}
                                                    </h3>
                                                </div>
                                                <div className={styles.grid}>
                                                    {lessons.map((lesson, idx) => renderLessonCard(lesson, idx))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {isOpen && !hasLessons && (
                                    <p style={{ padding: '0.75rem 1rem', color: 'hsl(var(--muted-foreground))', fontSize: '0.875rem' }}>
                                        No lessons in this phase yet.
                                    </p>
                                )}
                            </div>
                        )
                    })}

                    {unassigned.length > 0 && (
                        <div className={styles.unassignedSection}>
                            <h2 className={styles.phaseTitle}>Unassigned Lessons</h2>
                            <div className={styles.grid}>
                                {unassigned.map((lesson, idx) => renderLessonCard(lesson, idx))}
                            </div>
                        </div>
                    )}
                </>
            ) : (
                /* Fallback: flat grid when no phases exist */
                <div className={styles.grid}>
                    {dbLessons.map((lesson, idx) => renderLessonCard(lesson, idx))}
                </div>
            )}
        </div>
    )
}
