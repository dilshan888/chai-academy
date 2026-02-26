"use client"

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Shield, Zap, Check, Lock, BookOpen, Trophy, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/Avatar'
import { useProgress } from '@/lib/ProgressContext'
import { LESSONS } from '@/data/lessons'
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

    // Fetch profile
    useEffect(() => {
        async function loadProfile() {
            try {
                const res = await fetch('/api/user')
                if (res.ok) {
                    const data = await res.json()
                    const user = data.user
                    setProfile(user)
                    setName(user.name || '')
                    setDepartment(user.department || '')
                    setJobTitle(user.jobTitle || '')
                    setLearningPace(user.learningPace || 'balanced')
                    setWeeklyEmail(user.weeklyEmailSummary ?? true)
                    setOptOutLeaderboard(user.optOutOfLeaderboard ?? false)
                }
            } catch (e) {
                console.error('Failed to load profile', e)
            } finally {
                setLoading(false)
            }
        }
        loadProfile()
    }, [])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setMessage({ type: '', text: '' })

        try {
            const res = await fetch('/api/user', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name || undefined,
                    department: department || undefined,
                    jobTitle: jobTitle || undefined,
                    password: password || undefined,
                    learningPace,
                    weeklyEmailSummary: weeklyEmail,
                    optOutOfLeaderboard: optOutLeaderboard,
                }),
            })

            if (res.ok) {
                setMessage({ type: 'success', text: 'Profile updated successfully!' })
                await updateSession({ name })
                setPassword('')
            } else {
                const data = await res.json()
                setMessage({ type: 'error', text: data.error || 'Failed to update' })
            }
        } catch {
            setMessage({ type: 'error', text: 'An unexpected error occurred' })
        } finally {
            setSaving(false)
        }
    }

    // Build lesson list for timeline
    const lessonList = Object.values(LESSONS).sort((a, b) => a.id - b.id)
    const firstIncomplete = lessonList.find((l) => !completedLessons.includes(String(l.id)))

    if (loading) {
        return <div className={styles.loading}>Loading profile...</div>
    }

    const displayName = profile?.name || session?.user?.name || 'User'

    return (
        <div className={styles.container}>
            {/* Left Column: Profile Info */}
            <div className={styles.leftColumn}>
                {/* Profile Header */}
                <div className={styles.profileHeader}>
                    <Avatar name={displayName} size="lg" />
                    <div className={styles.profileInfo}>
                        <h1 className={styles.profileName}>{displayName}</h1>
                        <p className={styles.profileDept}>
                            {profile?.department || 'No department'} {profile?.jobTitle ? `· ${profile.jobTitle}` : ''}
                        </p>
                        <div className={styles.profileBadges}>
                            <span className={styles.profileLevelBadge}>
                                <Shield size={12} />
                                Level {stats.level} - {stats.levelTitle}
                            </span>
                            <span className={styles.profileXP}>
                                <Zap size={12} style={{ verticalAlign: 'middle' }} /> {stats.totalXP.toLocaleString()} XP
                            </span>
                        </div>
                    </div>
                </div>

                {/* Personal Information Form */}
                <div className={styles.formCard}>
                    <h2 className={styles.formCardTitle}>Personal Information</h2>
                    <form onSubmit={handleSave}>
                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Full Name</label>
                                <input
                                    type="text"
                                    className={styles.formInput}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your name"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Email</label>
                                <input
                                    type="email"
                                    className={styles.formInput}
                                    value={profile?.email || ''}
                                    disabled
                                    style={{ opacity: 0.6 }}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Department</label>
                                <select
                                    className={styles.formSelect}
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                >
                                    <option value="">Select department</option>
                                    {DEPARTMENTS.map((d) => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Job Title</label>
                                <input
                                    type="text"
                                    className={styles.formInput}
                                    value={jobTitle}
                                    onChange={(e) => setJobTitle(e.target.value)}
                                    placeholder="e.g. Administrative Officer"
                                />
                            </div>
                        </div>

                        {message.text && (
                            <div className={`${styles.formMessage} ${message.type === 'success' ? styles.formMessageSuccess : styles.formMessageError}`}>
                                {message.text}
                            </div>
                        )}

                        <div className={styles.formActions}>
                            <Button type="submit" disabled={saving}>
                                {saving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Security Section */}
                <div className={styles.formCard}>
                    <h2 className={styles.formCardTitle}>Security</h2>
                    <div className={styles.formGrid}>
                        <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                            <label className={styles.formLabel}>
                                New Password <span className={styles.formLabelHint}>(leave blank to keep current)</span>
                            </label>
                            <input
                                type="password"
                                className={styles.formInput}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Min. 6 characters"
                            />
                        </div>
                    </div>
                </div>

                {/* Learning Preferences */}
                <div className={styles.formCard}>
                    <h2 className={styles.formCardTitle}>Learning Preferences</h2>
                    <div className={styles.formGroup} style={{ marginBottom: '1rem' }}>
                        <label className={styles.formLabel}>Learning Pace</label>
                        <select
                            className={styles.formSelect}
                            value={learningPace}
                            onChange={(e) => setLearningPace(e.target.value)}
                        >
                            <option value="relaxed">Relaxed - 1 lesson per week</option>
                            <option value="balanced">Balanced - 2-3 lessons per week</option>
                            <option value="intensive">Intensive - Daily lessons</option>
                        </select>
                    </div>

                    <div className={styles.toggleRow}>
                        <div>
                            <div className={styles.toggleLabel}>Weekly Email Summary</div>
                            <div className={styles.toggleDesc}>Receive a weekly progress report via email</div>
                        </div>
                        <button
                            type="button"
                            className={`${styles.toggle} ${weeklyEmail ? styles.toggleOn : styles.toggleOff}`}
                            onClick={() => setWeeklyEmail(!weeklyEmail)}
                        >
                            <div className={`${styles.toggleKnob} ${weeklyEmail ? styles.toggleKnobOn : styles.toggleKnobOff}`} />
                        </button>
                    </div>

                    <div className={styles.toggleRow}>
                        <div>
                            <div className={styles.toggleLabel}>Opt-out of Public Leaderboard</div>
                            <div className={styles.toggleDesc}>Hide your profile from the global ranking list</div>
                        </div>
                        <button
                            type="button"
                            className={`${styles.toggle} ${optOutLeaderboard ? styles.toggleOn : styles.toggleOff}`}
                            onClick={() => setOptOutLeaderboard(!optOutLeaderboard)}
                        >
                            <div className={`${styles.toggleKnob} ${optOutLeaderboard ? styles.toggleKnobOn : styles.toggleKnobOff}`} />
                        </button>
                    </div>
                </div>

                {/* Stats Footer */}
                <div className={styles.statsFooter}>
                    <div className={styles.statsFooterCard}>
                        <div className={styles.statsFooterValue}>{completedLessons.length}</div>
                        <div className={styles.statsFooterLabel}>Modules Done</div>
                    </div>
                    <div className={styles.statsFooterCard}>
                        <div className={styles.statsFooterValue}>{stats.badgeCount}</div>
                        <div className={styles.statsFooterLabel}>Badges</div>
                    </div>
                    <div className={styles.statsFooterCard}>
                        <div className={styles.statsFooterValue}>{stats.currentStreak}d</div>
                        <div className={styles.statsFooterLabel}>Streak</div>
                    </div>
                </div>
            </div>

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
                                            Module {lesson.id} · {lesson.sections.length} sections
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
