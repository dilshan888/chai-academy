"use client"

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Shield, Zap, Check, Lock, BookOpen, Trophy, TrendingUp, Calendar, Award, Flame } from 'lucide-react'
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
    const { stats, completedLessons, overallProgress } = useProgress()

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

                const lessonsRes = await fetch('/api/lessons')
                if (lessonsRes.ok) {
                    const lessons = await lessonsRes.json()
                    setLessonList(lessons.sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)))
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
        e.preventDefault()
        setSaving(true)
        setMessage({ type: '', text: '' })

        try {
            const body: Record<string, unknown> = {
                name,
                department,
                jobTitle,
                learningPace,
                weeklyEmailSummary: weeklyEmail,
                optOutOfLeaderboard: optOutLeaderboard,
            }
            if (password.trim().length > 0) {
                body.password = password
            }

            const res = await fetch('/api/user', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            })

            if (res.ok) {
                const data = await res.json()
                setMessage({ type: 'success', text: 'Profile updated successfully!' })
                setPassword('')
                // Update session name if changed
                if (data.user?.name && data.user.name !== session?.user?.name) {
                    await updateSession({ name: data.user.name })
                }
            } else {
                const err = await res.json()
                setMessage({ type: 'error', text: err.error || 'Failed to update profile' })
            }
        } catch {
            setMessage({ type: 'error', text: 'Network error. Please try again.' })
        } finally {
            setSaving(false)
        }
    }

    // Build timeline info
    const firstIncomplete = lessonList.find((l) => !completedLessons.includes(String(l.id)))

    if (loading) {
        return <div className={styles.loading}>Loading profile...</div>
    }

    const displayName = profile?.name || session?.user?.name || 'User'
    const memberSince = profile?.createdAt
        ? new Date(profile.createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
        : ''

    return (
        <div className={styles.container}>
            {/* Left Column: Profile Info & Settings */}
            <div className={styles.leftColumn}>
                {/* Profile Header Card */}
                <div className={styles.profileHeader}>
                    <Avatar name={displayName} size="lg" />
                    <div className={styles.profileInfo}>
                        <h1 className={styles.profileName}>{displayName}</h1>
                        <p className={styles.profileDept}>
                            {profile?.jobTitle || 'Staff Member'}
                            {profile?.department ? ` · ${profile.department}` : ''}
                        </p>
                        <div className={styles.profileBadges}>
                            <span className={styles.profileLevelBadge}>
                                <Shield size={13} />
                                Lv.{stats.level} {stats.levelTitle}
                            </span>
                            <span className={styles.profileXP}>
                                <Zap size={13} /> {stats.totalXP.toLocaleString()} XP
                            </span>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className={styles.statsFooter}>
                    <div className={styles.statsFooterCard}>
                        <div className={styles.statsFooterValue}>{completedLessons.length}</div>
                        <div className={styles.statsFooterLabel}>Lessons Done</div>
                    </div>
                    <div className={styles.statsFooterCard}>
                        <div className={styles.statsFooterValue}>{stats.currentStreak}</div>
                        <div className={styles.statsFooterLabel}>
                            <Flame size={12} style={{ display: 'inline', verticalAlign: '-1px' }} /> Day Streak
                        </div>
                    </div>
                    <div className={styles.statsFooterCard}>
                        <div className={styles.statsFooterValue}>{overallProgress}%</div>
                        <div className={styles.statsFooterLabel}>Progress</div>
                    </div>
                </div>

                {/* Edit Profile Form */}
                <form className={styles.formCard} onSubmit={handleSave}>
                    <h2 className={styles.formCardTitle}>Edit Profile</h2>

                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Full Name</label>
                            <input
                                className={styles.formInput}
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your name"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Email</label>
                            <input
                                className={styles.formInput}
                                type="email"
                                value={profile?.email || ''}
                                disabled
                                style={{ opacity: 0.6, cursor: 'not-allowed' }}
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
                                className={styles.formInput}
                                type="text"
                                value={jobTitle}
                                onChange={(e) => setJobTitle(e.target.value)}
                                placeholder="e.g. Administrative Officer"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>
                                New Password <span className={styles.formLabelHint}>(leave blank to keep)</span>
                            </label>
                            <input
                                className={styles.formInput}
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Learning Pace</label>
                            <select
                                className={styles.formSelect}
                                value={learningPace}
                                onChange={(e) => setLearningPace(e.target.value)}
                            >
                                <option value="relaxed">Relaxed</option>
                                <option value="balanced">Balanced</option>
                                <option value="intensive">Intensive</option>
                            </select>
                        </div>
                    </div>

                    {/* Toggles */}
                    <div style={{ marginTop: '1.25rem' }}>
                        <div className={styles.toggleRow}>
                            <div>
                                <div className={styles.toggleLabel}>Weekly Email Summary</div>
                                <div className={styles.toggleDesc}>Receive a weekly digest of your learning progress</div>
                            </div>
                            <button
                                type="button"
                                className={`${styles.toggle} ${weeklyEmail ? styles.toggleOn : styles.toggleOff}`}
                                onClick={() => setWeeklyEmail(!weeklyEmail)}
                            >
                                <span className={`${styles.toggleKnob} ${weeklyEmail ? styles.toggleKnobOn : styles.toggleKnobOff}`} />
                            </button>
                        </div>

                        <div className={styles.toggleRow}>
                            <div>
                                <div className={styles.toggleLabel}>Opt Out of Leaderboard</div>
                                <div className={styles.toggleDesc}>Hide your name from the public leaderboard</div>
                            </div>
                            <button
                                type="button"
                                className={`${styles.toggle} ${optOutLeaderboard ? styles.toggleOn : styles.toggleOff}`}
                                onClick={() => setOptOutLeaderboard(!optOutLeaderboard)}
                            >
                                <span className={`${styles.toggleKnob} ${optOutLeaderboard ? styles.toggleKnobOn : styles.toggleKnobOff}`} />
                            </button>
                        </div>
                    </div>

                    {/* Message */}
                    {message.text && (
                        <div className={`${styles.formMessage} ${message.type === 'success' ? styles.formMessageSuccess : styles.formMessageError}`}>
                            {message.text}
                        </div>
                    )}

                    {/* Actions */}
                    <div className={styles.formActions}>
                        <Button type="submit" disabled={saving}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>

                {/* Member Since */}
                {memberSince && (
                    <div className={styles.memberSince}>
                        <Calendar size={14} />
                        Member since {memberSince}
                    </div>
                )}
            </div>

            {/* Right Column: Learning Path */}
            <div className={styles.rightColumn}>
                <div className={styles.timelineCard}>
                    <h2 className={styles.timelineTitle}>
                        <TrendingUp size={18} style={{ display: 'inline', verticalAlign: '-3px', marginRight: '0.4rem' }} />
                        Learning Path
                    </h2>
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
                                            {lesson.module ? lesson.module.title : lesson.slug}
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
