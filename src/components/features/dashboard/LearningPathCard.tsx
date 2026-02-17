"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle, Circle, BookOpen } from 'lucide-react'
import { useProgress } from '@/lib/ProgressContext'
import styles from './dashboard.module.css'

const STATIC_MODULES = [
    { id: '1', title: 'What AI Is (and Is Not)', sections: 4 },
    { id: '2', title: 'Where AI Appears in University Administration', sections: 4 },
    { id: '3', title: 'Data, Privacy, and GDPR Basics', sections: 4 },
    { id: '4', title: 'EU AI Act Overview for Admin Work', sections: 4 },
    { id: '5', title: 'High Risk vs Low Risk AI Systems', sections: 4 },
    { id: '6', title: 'Human Oversight and Responsibility', sections: 4 },
]

interface DBLesson {
    id: string
    title: string
    slug: string
}

export function LearningPathCard() {
    const { isLessonComplete } = useProgress()
    const [allModules, setAllModules] = useState(STATIC_MODULES)

    useEffect(() => {
        async function fetchDB() {
            try {
                const res = await fetch('/api/lessons')
                if (res.ok) {
                    const data: DBLesson[] = await res.json()
                    const extra = data.map((l) => ({ id: l.id, title: l.title, sections: 0 }))
                    setAllModules([...STATIC_MODULES, ...extra])
                }
            } catch { /* keep static */ }
        }
        fetchDB()
    }, [])

    return (
        <div className={styles.learningPathCard}>
            <div className={styles.learningPathHeader}>
                <BookOpen size={18} style={{ color: 'hsl(var(--accent))' }} />
                <h3 className={styles.learningPathTitle}>Learning Path</h3>
            </div>

            <div className={styles.learningPathTimeline}>
                {allModules.map((mod, idx) => {
                    const completed = isLessonComplete(mod.id)
                    const isStatic = STATIC_MODULES.some(s => s.id === mod.id)
                    const href = isStatic ? `/lesson/${mod.id}` : `/lessons/${mod.id}`

                    return (
                        <Link key={mod.id} href={href} className={styles.learningPathItem}>
                            <div className={styles.learningPathDot}>
                                {completed ? (
                                    <CheckCircle size={20} className={styles.learningPathDotDone} />
                                ) : (
                                    <Circle size={20} className={styles.learningPathDotPending} />
                                )}
                                {idx < allModules.length - 1 && (
                                    <div className={`${styles.learningPathLine} ${completed ? styles.learningPathLineDone : ''}`} />
                                )}
                            </div>
                            <div className={styles.learningPathInfo}>
                                <span className={`${styles.learningPathName} ${completed ? styles.learningPathNameDone : ''}`}>
                                    {mod.title}
                                </span>
                                <span className={styles.learningPathMeta}>
                                    Module {idx + 1}{mod.sections > 0 ? ` · ${mod.sections} sections` : ''}
                                </span>
                            </div>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
