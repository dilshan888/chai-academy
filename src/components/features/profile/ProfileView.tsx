"use client"

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Shield, Zap, Check, Lock, BookOpen, Trophy, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/Avatar'
import { useProgress } from '@/lib/ProgressContext'
import styles from './profile.module.css'

interface UserProfile {
    id: string
    name: string
    email: string
    department: string | null
    jobTitle: string | null
    learningPace: string
    weeklyEmailSummary: boolean
    optOutOfLeaderboard: boolean
    createdAt: string
}

const DEPARTMENTS = [
    'Administration',
    'Finance',
    'Human Resources',
    'IT Services',
    'Academic Affairs',
    'Student Services',
    'Research',
    'Library Services',
    'Marketing',
    'Facilities',
]

export function ProfileView() {
    const { data: session, update: updateSession } = useSession()
    const { stats, completedLessons } = useProgress()

    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [lessonList, setLessonList] = useState<any[]>([])

    // Form state
    const [name, setName] = useState('')
    const [department, setDepartment] = useState('')
    const [jobTitle, setJobTitle] = useState('')
    const [password, setPassword] = useState('')
    const [learningPace, setLearningPace] = useState('balanced')
    const [weeklyEmail, setWeeklyEmail] = useState(true)
    const [optOutLeaderboard, setOptOutLeaderboard] = useState(false)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState({ type: '', text: '' })

    // Fetch profile and lessons
    useEffect(() => {
        async function loadData() {
            try {
                // Fetch profile
                const profileRes = await fetch('/api/user')
                if (profileRes.ok) {
                    const data = await profileRes.json()
                    const user = data.user
                    setProfile(user)
                    setName(user.name || '')
                    setDepartment(user.department || '')
                    setJobTitle(user.jobTitle || '')
                    setLearningPace(user.learningPace || 'balanced')
                    setWeeklyEmail(user.weeklyEmailSummary ?? true)
                    setOptOutLeaderboard(user.optOutOfLeaderboard ?? false)
                }

                // Fetch lessons for timeline
                const lessonsRes = await fetch('/api/lessons')
                if (lessonsRes.ok) {
                    const lessons = await lessonsRes.json()
                    setLessonList(lessons.sort((a: any, b: any) => parseInt(a.id) - parseInt(b.id)))
                }
            } catch (e) {
                console.error('Failed to load data', e)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [])

    const handleSave = async (e: React.FormEvent) => {
        // ...
    }

    // Build timeline info
    const firstIncomplete = lessonList.find((l) => !completedLessons.includes(String(l.id)))

    if (loading) {
        return <div className={styles.loading}>Loading profile...</div>
    }

    const displayName = profile?.name || session?.user?.name || 'User'

    return (
        <div className={styles.container}>
            {/* ... */}
            {/* Right Column: Learning Path */}
            <div className={styles.rightColumn}>
                <div className={styles.timelineCard}>
                    <h2 className={styles.timelineTitle}>Learning Path</h2>
                    <div className={styles.timeline}>
                        {lessonList.map((lesson) => {
                            const isCompleted = completedLessons.includes(String(lesson.id))
                            const isCurrent = !isCompleted && firstIncomplete?.id === lesson.id

                            return (
                                <div key={lesson.id} className={styles.timelineItem}>
                                    <div className={`${styles.timelineDot} ${isCompleted ? styles.timelineDotCompleted : isCurrent ? styles.timelineDotCurrent : styles.timelineDotLocked}`}>
                                        {isCompleted ? (
                                            <Check size={12} />
                                        ) : isCurrent ? (
                                            <BookOpen size={12} />
                                        ) : (
                                            <Lock size={10} />
                                        )}
                                    </div>
                                    <div className={styles.timelineContent}>
                                        <div className={`${styles.timelineItemTitle} ${isCompleted ? styles.timelineItemCompleted : isCurrent ? styles.timelineItemActive : styles.timelineItemLockedTitle}`}>
                                            {lesson.title}
                                        </div>
                                        <div className={styles.timelineItemSub}>
                                            Module {lesson.id} · {lesson.slug}
                                        </div>
                                        {isCurrent && (
                                            <div className={styles.timelineItemCurrentBadge}>In Progress</div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}
