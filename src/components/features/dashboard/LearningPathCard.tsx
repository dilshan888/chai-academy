"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle, Circle, BookOpen, Loader2 } from 'lucide-react'
import { useProgress } from '@/lib/ProgressContext'
import styles from './dashboard.module.css'

interface LessonInfo {
    id: string
    title: string
    sortOrder: number
}

interface ModuleInfo {
    id: string
    title: string
    sortOrder: number
    lessons: LessonInfo[]
}

interface PhaseInfo {
    id: string
    title: string
    sortOrder: number
    modules: ModuleInfo[]
}

export function LearningPathCard() {
    const { isLessonComplete } = useProgress()
    const [phases, setPhases] = useState<PhaseInfo[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchHierarchy() {
            try {
                // Fetch all phases, then for each phase fetch its modules+lessons
                const phasesRes = await fetch('/api/phases')
                if (!phasesRes.ok) return

                const phasesData = await phasesRes.json()
                const sorted = phasesData.sort((a: any, b: any) => a.sortOrder - b.sortOrder)

                // Fetch each phase's detail (includes modules)
                const phaseDetails: PhaseInfo[] = await Promise.all(
                    sorted.map(async (phase: any) => {
                        const res = await fetch(`/api/phases/${phase.id}`)
                        if (!res.ok) return { ...phase, modules: [] }

                        const detail = await res.json()
                        const modules = (detail.modules || [])
                            .sort((a: any, b: any) => a.sortOrder - b.sortOrder)

                        // Fetch lessons for each module
                        const modulesWithLessons: ModuleInfo[] = await Promise.all(
                            modules.map(async (mod: any) => {
                                const mRes = await fetch(`/api/modules/${mod.id}`)
                                if (!mRes.ok) return { ...mod, lessons: [] }
                                const mDetail = await mRes.json()
                                const lessons = (mDetail.lessons || [])
                                    .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                                    .map((l: any) => ({ id: l.id, title: l.title, sortOrder: l.sortOrder }))
                                return {
                                    id: mod.id,
                                    title: mod.title,
                                    sortOrder: mod.sortOrder,
                                    lessons,
                                }
                            })
                        )

                        return {
                            id: phase.id,
                            title: phase.title,
                            sortOrder: phase.sortOrder,
                            modules: modulesWithLessons,
                        }
                    })
                )

                setPhases(phaseDetails)
            } catch (e) {
                console.error("Failed to load learning path", e)
            } finally {
                setLoading(false)
            }
        }
        fetchHierarchy()
    }, [])

    if (loading) {
        return (
            <div className={styles.learningPathCard}>
                <div className={styles.learningPathHeader}>
                    <BookOpen size={18} style={{ color: 'hsl(var(--accent))' }} />
                    <h3 className={styles.learningPathTitle}>Learning Path</h3>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0' }}>
                    <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: 'hsl(var(--muted-foreground))' }} />
                </div>
            </div>
        )
    }

    if (phases.length === 0) {
        return (
            <div className={styles.learningPathCard}>
                <div className={styles.learningPathHeader}>
                    <BookOpen size={18} style={{ color: 'hsl(var(--accent))' }} />
                    <h3 className={styles.learningPathTitle}>Learning Path</h3>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))', padding: '1rem 0' }}>
                    No courses available yet. Check back soon.
                </p>
            </div>
        )
    }

    // Flatten all lessons to build the global timeline with connectors
    const allLessons: { lesson: LessonInfo; moduleTitle: string; phaseTitle: string; isFirstInModule: boolean }[] = []
    for (const phase of phases) {
        for (const mod of phase.modules) {
            mod.lessons.forEach((lesson, idx) => {
                allLessons.push({
                    lesson,
                    moduleTitle: mod.title,
                    phaseTitle: phase.title,
                    isFirstInModule: idx === 0,
                })
            })
        }
    }

    return (
        <div className={styles.learningPathCard}>
            <div className={styles.learningPathHeader}>
                <BookOpen size={18} style={{ color: 'hsl(var(--accent))' }} />
                <h3 className={styles.learningPathTitle}>Learning Path</h3>
            </div>

            <div className={styles.phasesContainer}>
                {phases.map(phase => {
                    const totalInPhase = phase.modules.reduce((sum, m) => sum + m.lessons.length, 0)
                    const completedInPhase = phase.modules.reduce(
                        (sum, m) => sum + m.lessons.filter(l => isLessonComplete(l.id)).length, 0
                    )

                    return (
                        <div key={phase.id} className={styles.learningPhase}>
                            <div className={styles.learningPhaseHeader}>
                                <BookOpen size={16} className={styles.phaseIcon} />
                                <h4 className={styles.learningPhaseTitle}>{phase.title}</h4>
                                <span className={styles.phaseProgressBadge}>
                                    {completedInPhase}/{totalInPhase}
                                </span>
                            </div>

                            {phase.modules.map(mod => (
                                <div key={mod.id} className={styles.moduleGroup}>
                                    <div className={styles.moduleGroupTitle}>{mod.title}</div>
                                    <div className={styles.learningPathTimeline}>
                                        {mod.lessons.map((lesson, idx) => {
                                            const completed = isLessonComplete(lesson.id)
                                            return (
                                                <div key={lesson.id} className={styles.learningPathItemWrapper}>
                                                    <div className={styles.learningPathDot}>
                                                        {completed ? (
                                                            <CheckCircle size={20} className={styles.learningPathDotDone} />
                                                        ) : (
                                                            <Circle size={20} className={styles.learningPathDotPending} />
                                                        )}
                                                        {idx < mod.lessons.length - 1 && (
                                                            <div className={`${styles.learningPathLine} ${completed ? styles.learningPathLineDone : ''}`} />
                                                        )}
                                                    </div>
                                                    <Link href={`/lesson/${lesson.id}`} className={styles.learningPathItem}>
                                                        <div className={styles.learningPathInfo}>
                                                            <span className={`${styles.learningPathName} ${completed ? styles.learningPathNameDone : ''}`}>
                                                                {lesson.title}
                                                            </span>
                                                        </div>
                                                    </Link>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
