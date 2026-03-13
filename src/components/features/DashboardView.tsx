"use client"

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
    Zap, Flame, Shield, BookOpen, Clock, ChevronRight,
    Trophy, TrendingUp, Target, Sparkles
} from 'lucide-react'
import { useProgress } from '@/lib/ProgressContext'
import { ProgressBar } from '@/components/ui/progress-bar'
import { Button } from '@/components/ui/button'
import styles from './dashboard/dashboard.module.css'

interface DBLesson {
    id: string
    title: string
    slug: string
    description: string | null
    difficulty: string
    sortOrder: number
    moduleId: string | null
    module?: {
        id: string
        title: string
        phase?: { id: string; title: string; slug: string } | null
    } | null
}

interface CourseProgress {
    id: string
    title: string
    slug: string
    description: string | null
    duration: string | null
    xpReward: number
    moduleCount: number
    lessonCount: number
    completedLessons: number
    progress: number
}

interface Achievement {
    id: string
    name: string
    description: string
    icon: string
    unlockedAt: string | null
}

const GRADIENTS = [
    'linear-gradient(135deg, #7a1d38 0%, #9d2447 40%, #c2365c 100%)',
    'linear-gradient(135deg, #1e3a5f 0%, #2563eb 40%, #3b82f6 100%)',
    'linear-gradient(135deg, #065f46 0%, #059669 40%, #10b981 100%)',
    'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 40%, #a78bfa 100%)',
]

function getGreeting() {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
}

export function DashboardView() {
    const { data: session } = useSession()
    const { stats, completedLessons, overallProgress, isLessonComplete } = useProgress()
    const userName = session?.user?.name?.split(' ')[0] || 'there'

    const [gamificationEnabled, setGamificationEnabled] = useState(true)
    const [courses, setCourses] = useState<CourseProgress[]>([])
    const [nextLesson, setNextLesson] = useState<DBLesson | null>(null)
    const [achievements, setAchievements] = useState<Achievement[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadAll() {
            try {
                const [settingsRes, coursesRes, lessonsRes, achieveRes] = await Promise.all([
                    fetch('/api/gamification/settings'),
                    fetch('/api/courses'),
                    fetch('/api/lessons'),
                    fetch('/api/gamification/achievements'),
                ])

                if (settingsRes.ok) {
                    const s = await settingsRes.json()
                    setGamificationEnabled(s.globalGamificationEnabled)
                }
                if (coursesRes.ok) {
                    setCourses(await coursesRes.json())
                }
                if (lessonsRes.ok) {
                    const lessons: DBLesson[] = await lessonsRes.json()
                    const curriculum = lessons
                        .filter(l => l.moduleId)
                        .sort((a, b) => a.sortOrder - b.sortOrder)
                    const next = curriculum.find(l => !isLessonComplete(l.id))
                    setNextLesson(next || null)
                }
                if (achieveRes.ok) {
                    const a = await achieveRes.json()
                    setAchievements(
                        (a.achievements || [])
                            .filter((ach: Achievement) => ach.unlockedAt)
                            .slice(0, 3)
                    )
                }
            } catch (e) {
                console.error('Dashboard load error', e)
            } finally {
                setLoading(false)
            }
        }
        loadAll()
    }, [isLessonComplete])

    const totalLessons = courses.reduce((s, c) => s + c.lessonCount, 0)
    const totalCompleted = courses.reduce((s, c) => s + c.completedLessons, 0)

    return (
        <div className={styles.dashboardContainer}>
            {/* ─── Hero Banner ─── */}
            <div className={styles.heroBanner}>
                <div className={styles.heroContent}>
                    <div className={styles.heroText}>
                        <h1 className={styles.heroTitle}>
                            {getGreeting()}, {userName} <Sparkles size={22} style={{ display: 'inline', verticalAlign: '-3px' }} aria-hidden="true" />
                        </h1>
                        <p className={styles.heroSubtitle}>
                            {totalCompleted === totalLessons && totalLessons > 0
                                ? 'You\'ve completed all available lessons — amazing work!'
                                : nextLesson
                                    ? `Continue with "${nextLesson.title}"`
                                    : 'Ready to continue your AI compliance journey?'}
                        </p>
                    </div>
                    {nextLesson && (
                        <Link href={`/lesson/${nextLesson.id}`} className={styles.heroCTA} aria-label={`Resume learning: ${nextLesson.title}`}>
                            <Button>Resume Learning <ChevronRight size={16} aria-hidden="true" /></Button>
                        </Link>
                    )}
                </div>
                {/* Progress indicator in hero */}
                <div className={styles.heroProgress}>
                    <div className={styles.heroProgressInfo}>
                        <span>{totalCompleted}/{totalLessons} lessons</span>
                        <span className={styles.heroProgressPercent}>{overallProgress}%</span>
                    </div>
                    <div className={styles.heroProgressBar}>
                        <div className={styles.heroProgressFill} style={{ width: `${overallProgress}%` }} />
                    </div>
                </div>
            </div>

            {/* ─── Stat Cards ─── */}
            {gamificationEnabled && (
                <div className={styles.statCardsRow}>
                    <div className={`${styles.statCard} ${styles.statCardXP}`}>
                        <div className={styles.statCardIconCircle} style={{ background: 'rgba(16,185,129,0.12)' }}>
                            <Zap size={18} style={{ color: '#10B981' }} aria-hidden="true" />
                        </div>
                        <div className={styles.statCardContent}>
                            <span className={styles.statCardLabel}>Total XP</span>
                            <span className={styles.statCardValue}>{stats.totalXP.toLocaleString()}</span>
                            <span className={styles.statCardSub} style={{ color: '#10B981' }}>+{stats.todayXP} today</span>
                        </div>
                    </div>

                    <div className={`${styles.statCard} ${styles.statCardStreak}`}>
                        <div className={styles.statCardIconCircle} style={{ background: 'rgba(249,115,22,0.12)' }}>
                            <Flame size={18} style={{ color: '#F97316' }} aria-hidden="true" />
                        </div>
                        <div className={styles.statCardContent}>
                            <span className={styles.statCardLabel}>Streak</span>
                            <span className={styles.statCardValue}>
                                {stats.currentStreak} {stats.currentStreak === 1 ? 'Day' : 'Days'}
                            </span>
                            <span className={styles.statCardSub} style={{ color: '#F97316' }}>
                                {stats.streakMultiplier > 1 ? `${stats.streakMultiplier.toFixed(1)}x bonus` : 'Keep it up!'}
                            </span>
                        </div>
                    </div>

                    <div className={`${styles.statCard} ${styles.statCardLevel}`}>
                        <div className={styles.statCardIconCircle} style={{ background: 'hsl(var(--accent) / 0.12)' }}>
                            <Shield size={18} style={{ color: 'hsl(var(--accent))' }} aria-hidden="true" />
                        </div>
                        <div className={styles.statCardContent}>
                            <span className={styles.statCardLabel}>Level</span>
                            <span className={styles.statCardValue}>Lv. {stats.level}</span>
                            <span className={styles.statCardSub} style={{ color: 'hsl(var(--accent))' }}>
                                {stats.levelTitle}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Main Content ─── */}
            <div className={styles.dashboardGrid}>
                <div className={styles.mainColumn}>
                    {/* Course Progress Cards */}
                    <section>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>My Courses</h2>
                            <Link href="/courses" className={styles.sectionLink} aria-label="View all courses">View all <ChevronRight size={14} aria-hidden="true" /></Link>
                        </div>
                        <div className={styles.courseProgressGrid}>
                            {courses.map((course, idx) => (
                                <Link key={course.id} href={`/courses/${course.slug}`} className={styles.courseProgressCard} aria-label={`Course: ${course.title}, ${course.progress}% completed`}>
                                    <div className={styles.courseProgressBanner} style={{ background: GRADIENTS[idx % GRADIENTS.length] }}>
                                        <span className={styles.courseProgressTag}>
                                            {course.moduleCount} {course.moduleCount === 1 ? 'Module' : 'Modules'}
                                        </span>
                                    </div>
                                    <div className={styles.courseProgressBody}>
                                        <h3 className={styles.courseProgressName}>{course.title}</h3>
                                        <div className={styles.courseProgressMeta}>
                                            {course.duration && (
                                                <span><Clock size={12} aria-hidden="true" /> {course.duration}</span>
                                            )}
                                            <span><Zap size={12} aria-hidden="true" /> {course.xpReward} XP</span>
                                        </div>
                                        <div className={styles.courseProgressBarSection}>
                                            <div className={styles.courseProgressTrack}>
                                                <div className={styles.courseProgressFillBar} style={{ width: `${course.progress}%` }} />
                                            </div>
                                            <span className={styles.courseProgressPercent}>{course.progress}%</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>

                    {/* Up Next */}
                    {nextLesson && (
                        <section>
                            <div className={styles.sectionHeader}>
                                <h2 className={styles.sectionTitle}>Up Next</h2>
                            </div>
                            <Link href={`/lesson/${nextLesson.id}`} className={styles.upNextCard} aria-label={`Continue lesson: ${nextLesson.title}`}>
                                <div className={styles.upNextLeft}>
                                    <div className={styles.upNextIcon}>
                                        <Target size={20} aria-hidden="true" />
                                    </div>
                                    <div>
                                        <h3 className={styles.upNextTitle}>{nextLesson.title}</h3>
                                        <p className={styles.upNextMeta}>
                                            {nextLesson.module?.title || 'Lesson'}
                                            {nextLesson.difficulty && ` · ${nextLesson.difficulty.charAt(0).toUpperCase() + nextLesson.difficulty.slice(1)}`}
                                        </p>
                                    </div>
                                </div>
                                <ChevronRight size={18} className={styles.upNextArrow} aria-hidden="true" />
                            </Link>
                        </section>
                    )}
                </div>

                {/* Sidebar */}
                <div className={styles.sideColumn}>
                    {/* Quick Stats Summary */}
                    <div className={styles.sideCard}>
                        <div className={styles.sideCardHeader}>
                            <TrendingUp size={16} aria-hidden="true" />
                            <h3>Progress Overview</h3>
                        </div>
                        <div className={styles.progressOverviewItems}>
                            {courses.map((course, idx) => (
                                <div key={course.id} className={styles.progressOverviewItem}>
                                    <div className={styles.progressOverviewLabel}>
                                        <span className={styles.progressOverviewDot} style={{ background: GRADIENTS[idx % GRADIENTS.length].includes('#9d2447') ? '#9d2447' : '#2563eb' }} />
                                        <span>{course.title.replace(/^Phase \d+:\s*/, '')}</span>
                                    </div>
                                    <div className={styles.progressOverviewBarRow}>
                                        <div className={styles.progressOverviewBar}>
                                            <div className={styles.progressOverviewBarFill} style={{ width: `${course.progress}%` }} />
                                        </div>
                                        <span className={styles.progressOverviewValue}>{course.completedLessons}/{course.lessonCount}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Achievements */}
                    {gamificationEnabled && achievements.length > 0 && (
                        <div className={styles.sideCard}>
                            <div className={styles.sideCardHeader}>
                                <Trophy size={16} aria-hidden="true" />
                                <h3>Recent Achievements</h3>
                            </div>
                            <div className={styles.achievementsList}>
                                {achievements.map(ach => (
                                    <div key={ach.id} className={styles.achievementRow}>
                                        <span className={styles.achievementEmoji}>{ach.icon}</span>
                                        <div>
                                            <div className={styles.achievementRowName}>{ach.name}</div>
                                            <div className={styles.achievementRowDesc}>{ach.description}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Link href="/achievements" className={styles.sideCardFooterLink} aria-label="View all achievements">
                                View all <ChevronRight size={13} aria-hidden="true" />
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
