"use client"

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Trophy, Zap, Target, TrendingUp, Shield, Award, Lock } from 'lucide-react'
import { useProgress } from '@/lib/ProgressContext'
import { Avatar } from '@/components/ui/Avatar'
import styles from './achievements.module.css'

interface LeaderboardEntry {
    rank: number
    userId: string
    name: string
    department: string | null
    totalXP: number
    level: number
    levelTitle: string
    badgeCount: number
}

interface AchievementItem {
    id: string
    slug: string
    title: string
    description: string
    iconEmoji: string
    category: string
    xpReward: number
    unlocked: boolean
    unlockedAt: string | null
}

interface DeptData {
    name: string
    count: number
    avgXP: number
    totalXP: number
}

export function AchievementsView() {
    const { data: session } = useSession()
    const { stats } = useProgress()
    const [activeTab, setActiveTab] = useState<'leaderboards' | 'showcase'>('leaderboards')
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
    const [achievements, setAchievements] = useState<AchievementItem[]>([])
    const [myRank, setMyRank] = useState<number | null>(null)
    const [percentile, setPercentile] = useState(0)
    const [totalUsers, setTotalUsers] = useState(0)
    const [deptFilter, setDeptFilter] = useState('')
    const [departments, setDepartments] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [gamificationEnabled, setGamificationEnabled] = useState(true)

    // Fetch leaderboard
    useEffect(() => {
        async function loadLeaderboard() {
            try {
                // Fetch settings
                const setRes = await fetch('/api/gamification/settings')
                if (setRes.ok) {
                    const setJson = await setRes.json()
                    setGamificationEnabled(setJson.globalGamificationEnabled)
                    if (!setJson.globalGamificationEnabled) {
                        setActiveTab('showcase')
                    }
                }

                const url = deptFilter
                    ? `/api/gamification/leaderboard?department=${encodeURIComponent(deptFilter)}`
                    : '/api/gamification/leaderboard'
                const res = await fetch(url)
                if (res.ok) {
                    const data = await res.json()
                    setLeaderboard(data.leaderboard || [])
                    setMyRank(data.myRank)
                    setPercentile(data.percentile ?? 0)
                    setTotalUsers(data.totalUsers ?? 0)

                    // Extract unique departments
                    if (!deptFilter) {
                        const depts = new Set<string>()
                        for (const entry of data.leaderboard) {
                            if (entry.department) depts.add(entry.department)
                        }
                        setDepartments(Array.from(depts).sort())
                    }
                }
            } catch (e) {
                console.error('Failed to load leaderboard', e)
            }
        }
        loadLeaderboard()
    }, [deptFilter])

    // Fetch achievements
    useEffect(() => {
        async function loadAchievements() {
            try {
                const res = await fetch('/api/gamification/achievements')
                if (res.ok) {
                    const data = await res.json()
                    setAchievements(data.achievements || [])
                }
            } catch (e) {
                console.error('Failed to load achievements', e)
            } finally {
                setLoading(false)
            }
        }
        loadAchievements()
    }, [])

    const unlockedCount = achievements.filter((a) => a.unlocked).length
    const certCount = 0 // placeholder until certificates phase

    if (loading) {
        return <div className={styles.loading}>Loading achievements...</div>
    }

    return (
        <div className={styles.container}>
            {/* Header */}
            <div>
                <h1 className={styles.pageTitle}>Achievements & Leaderboards</h1>
                <p className={styles.pageSub}>Track your milestones, earn badges, and see how you rank</p>
            </div>

            {/* Stats Row */}
            <div className={styles.statsRow}>
                {gamificationEnabled && (
                    <div className={styles.statCard}>
                        <div className={styles.statCardHeader}>
                            <span className={styles.statCardLabel}>Your Rank</span>
                            <div className={styles.statCardIcon} style={{ background: 'hsl(var(--accent) / 0.1)', color: 'hsl(var(--accent))' }}>
                                <TrendingUp size={14} />
                            </div>
                        </div>
                        <div className={styles.statCardValue}>#{myRank || '-'}</div>
                        <div className={styles.statCardSub}>of {totalUsers} learners</div>
                    </div>
                )}
                <div className={styles.statCard}>
                    <div className={styles.statCardHeader}>
                        <span className={styles.statCardLabel}>Total XP</span>
                        <div className={styles.statCardIcon} style={{ background: 'hsl(45 93% 47% / 0.1)', color: 'hsl(45 93% 47%)' }}>
                            <Zap size={14} />
                        </div>
                    </div>
                    <div className={styles.statCardValue}>{stats.totalXP.toLocaleString()}</div>
                    <div className={styles.statCardSub}>Level {stats.level} - {stats.levelTitle}</div>
                </div>
                {gamificationEnabled && (
                    <div className={styles.statCard}>
                        <div className={styles.statCardHeader}>
                            <span className={styles.statCardLabel}>Percentile</span>
                            <div className={styles.statCardIcon} style={{ background: 'hsl(142 76% 36% / 0.1)', color: '#10B981' }}>
                                <Target size={14} />
                            </div>
                        </div>
                        <div className={styles.statCardValue}>Top {100 - percentile}%</div>
                        <div className={styles.statCardSub}>among all learners</div>
                    </div>
                )}
                <div className={styles.statCard}>
                    <div className={styles.statCardHeader}>
                        <span className={styles.statCardLabel}>Badges</span>
                        <div className={styles.statCardIcon} style={{ background: 'hsl(25 95% 53% / 0.1)', color: 'hsl(25 95% 53%)' }}>
                            <Award size={14} />
                        </div>
                    </div>
                    <div className={styles.statCardValue}>{unlockedCount}</div>
                    <div className={styles.statCardSub}>of {achievements.length} earned</div>
                </div>
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
                {gamificationEnabled && (
                    <button
                        className={`${styles.tab} ${activeTab === 'leaderboards' ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('leaderboards')}
                    >
                        Leaderboards
                    </button>
                )}
                <button
                    className={`${styles.tab} ${activeTab === 'showcase' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('showcase')}
                >
                    My Showcase
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'leaderboards' ? (
                <div className={styles.leaderboardSection}>
                    {/* Top Learners */}
                    <div className={styles.leaderboardHeader}>
                        <span className={styles.leaderboardTitle}>Top Learners</span>
                        <select
                            className={styles.filterSelect}
                            value={deptFilter}
                            onChange={(e) => setDeptFilter(e.target.value)}
                        >
                            <option value="">All Departments</option>
                            {departments.map((d) => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.leaderboardTable}>
                        <div className={styles.leaderboardTableInner}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Rank</th>
                                        <th>Learner</th>
                                        <th>XP</th>
                                        <th>Level</th>
                                        <th>Badges</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaderboard.map((entry) => {
                                        const isMe = entry.userId === session?.user?.id
                                        return (
                                            <tr key={entry.userId} className={isMe ? styles.myRow : ''}>
                                                <td>
                                                    <span className={`${styles.rankCell} ${entry.rank === 1 ? styles.rankGold : entry.rank === 2 ? styles.rankSilver : entry.rank === 3 ? styles.rankBronze : ''}`}>
                                                        {entry.rank}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className={styles.userCell}>
                                                        <Avatar name={entry.name} size="sm" />
                                                        <div>
                                                            <div className={styles.userCellName}>
                                                                {entry.name} {isMe && '(You)'}
                                                            </div>
                                                            <div className={styles.userCellDept}>
                                                                {entry.department || 'Unassigned'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={styles.xpValue}>{entry.totalXP.toLocaleString()}</span>
                                                </td>
                                                <td>
                                                    <span className={styles.levelBadge}>
                                                        <Shield size={10} />
                                                        L{entry.level}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={styles.badgeCount}>
                                                        <Trophy size={12} style={{ color: 'hsl(var(--accent))' }} />
                                                        {entry.badgeCount}
                                                    </span>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                    {leaderboard.length === 0 && (
                                        <tr>
                                            <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'hsl(var(--muted-foreground))' }}>
                                                No leaderboard data yet
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                /* Achievement Showcase */
                <div className={styles.showcaseGrid}>
                    {achievements.map((a) => (
                        <div
                            key={a.id}
                            className={`${styles.achievementCard} ${!a.unlocked ? styles.achievementCardLocked : ''}`}
                        >
                            <span className={styles.achievementEmoji}>
                                {a.unlocked ? a.iconEmoji : '🔒'}
                            </span>
                            <div className={styles.achievementCardTitle}>{a.title}</div>
                            <div className={styles.achievementCardDesc}>{a.description}</div>
                            <div className={styles.achievementCardXP}>+{a.xpReward} XP</div>
                            <div className={styles.achievementCardStatus}>
                                {a.unlocked ? (
                                    <span className={styles.achievementUnlocked}>Unlocked</span>
                                ) : (
                                    <span className={styles.achievementLockedStatus}>
                                        <span className={styles.lockIcon}>
                                            <Lock size={10} /> Locked
                                        </span>
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
