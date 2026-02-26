"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle, Circle, BookOpen, Shield, GraduationCap } from 'lucide-react'
import { useProgress } from '@/lib/ProgressContext'
import styles from './dashboard.module.css'

interface DBLesson {
    id: string
    title: string
    slug: string
    difficulty?: string
}

export function LearningPathCard() {
    const { isLessonComplete } = useProgress()
    const [allModules, setAllModules] = useState<DBLesson[]>([
        { id: '1', title: 'What AI Is (and Is Not)', slug: 'what-ai-is', difficulty: 'beginner' },
        { id: '2', title: 'Where AI Appears in University Administration', slug: 'ai-in-admin', difficulty: 'beginner' },
        { id: '3', title: 'Data, Privacy, and GDPR Basics', slug: 'data-privacy-gdpr', difficulty: 'beginner' },
        { id: '4', title: 'EU AI Act Overview for Admin Work', slug: 'eu-ai-act-overview', difficulty: 'intermediate' },
        { id: '5', title: 'High Risk vs Low Risk AI Systems', slug: 'high-vs-low-risk', difficulty: 'intermediate' },
        { id: '6', title: 'Human Oversight and Responsibility', slug: 'human-oversight', difficulty: 'intermediate' },
        { id: '7', title: 'Auditing High-Risk AI in Admissions & HR', slug: 'auditing-high-risk-ai', difficulty: 'advanced' },
        { id: '8', title: 'Developing University AI Policies', slug: 'developing-uni-ai-policies', difficulty: 'advanced' },
        { id: '9', title: 'Managing AI Vendor Procurement', slug: 'managing-ai-vendor', difficulty: 'advanced' },
    ])

    useEffect(() => {
        async function fetchDB() {
            try {
                const res = await fetch('/api/lessons')
                if (res.ok) {
                    const data: DBLesson[] = await res.json()
                    if (data && data.length > 0) {
                        setAllModules(data)
                    }
                }
            } catch { /* keep static fallback */ }
        }
        fetchDB()
    }, [])

    const renderPhase = (phaseName: string, icon: React.ReactNode, filter: string, badgeClass: string) => {
        const modules = allModules.filter(m => m.difficulty === filter || (!m.difficulty && filter === 'beginner'))
        if (modules.length === 0) return null

        return (
            <div className={styles.learningPhase}>
                <div className={styles.learningPhaseHeader}>
                    {icon}
                    <h4 className={styles.learningPhaseTitle}>{phaseName}</h4>
                </div>
                <div className={styles.learningPathTimeline}>
                    {modules.map((mod, idx) => {
                        const completed = isLessonComplete(mod.id)
                        const href = parseInt(mod.id) <= 6 ? `/lesson/${mod.id}` : `/lessons/${mod.id}` // Handle static vs dynamic links

                        return (
                            <div key={mod.id} className={styles.learningPathItemWrapper}>
                                <div className={styles.learningPathDot}>
                                    {completed ? (
                                        <CheckCircle size={20} className={styles.learningPathDotDone} />
                                    ) : (
                                        <Circle size={20} className={styles.learningPathDotPending} />
                                    )}
                                    {idx < modules.length - 1 && (
                                        <div className={`${styles.learningPathLine} ${completed ? styles.learningPathLineDone : ''}`} />
                                    )}
                                </div>
                                <Link href={href} className={styles.learningPathItem}>
                                    <div className={styles.learningPathInfo}>
                                        <div className={styles.learningPathNameRow}>
                                            <span className={`${styles.learningPathName} ${completed ? styles.learningPathNameDone : ''}`}>
                                                {mod.title}
                                            </span>
                                            <span className={`${styles.phaseBadge} ${styles[badgeClass]}`}>
                                                {filter.charAt(0).toUpperCase() + filter.slice(1)}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

    return (
        <div className={styles.learningPathCard}>
            <div className={styles.learningPathHeader}>
                <BookOpen size={18} style={{ color: 'hsl(var(--accent))' }} />
                <h3 className={styles.learningPathTitle}>Onboarding Path</h3>
            </div>

            <div className={styles.phasesContainer}>
                {renderPhase("Phase 1: The Basics", <BookOpen size={16} className={styles.phaseIcon} />, 'beginner', 'badgeBeginner')}
                {renderPhase("Phase 2: Using AI Safely", <Shield size={16} className={styles.phaseIcon} />, 'intermediate', 'badgeIntermediate')}
                {renderPhase("Phase 3: AI Governance", <GraduationCap size={16} className={styles.phaseIcon} />, 'advanced', 'badgeAdvanced')}
            </div>
        </div>
    )
}
