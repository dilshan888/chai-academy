"use client"

import { useEffect, useState, useCallback } from 'react'
import { Zap, Users, CheckCircle, Target, TrendingUp, BookOpen, Shield, Award } from 'lucide-react'
import {
    AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import styles from './admin-analytics.module.css'

type DateRange = 7 | 30 | 90

interface Summary {
    periodXP: number
    activeDays: number
    newCompletions: number
    totalLearners: number
    overallOptimalRate: number
    totalScenarioResponses: number
}

interface EngagementPoint {
    date: string
    xp: number
    activeUsers: number
}

interface LessonPerf {
    id: string
    title: string
    completedCount: number
    totalLearners: number
    completionRate: number
}

interface ScenarioData {
    id: string
    title: string
    riskLevel: string
    totalResponses: number
    optimalCount: number
    optimalRate: number
}

interface DeptData {
    name: string
    learners: number
    avgXP: number
    avgCompletion: number
    totalXP: number
}

interface AnalyticsResponse {
    summary: Summary
    engagementTimeline: EngagementPoint[]
    lessonPerformance: LessonPerf[]
    scenarioAnalysis: ScenarioData[]
    riskDistribution: Record<string, number>
    departmentLeaderboard: DeptData[]
}

const RISK_COLORS: Record<string, string> = {
    UNACCEPTABLE: '#7c3aed',
    HIGH: '#dc2626',
    LIMITED: '#ea580c',
    MINIMAL: '#16a34a',
}

const RISK_LABELS: Record<string, string> = {
    UNACCEPTABLE: 'Unacceptable',
    HIGH: 'High',
    LIMITED: 'Limited',
    MINIMAL: 'Minimal',
}

function getRiskClass(level: string) {
    switch (level) {
        case 'HIGH': return styles.riskHigh
        case 'LIMITED': return styles.riskLimited
        case 'MINIMAL': return styles.riskMinimal
        case 'UNACCEPTABLE': return styles.riskUnacceptable
        default: return ''
    }
}

function getCompletionColor(rate: number): string {
    if (rate >= 75) return '#16a34a'
    if (rate >= 40) return '#ea580c'
    return '#dc2626'
}

function formatShortDate(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export function AdminAnalyticsView() {
    const [data, setData] = useState<AnalyticsResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [range, setRange] = useState<DateRange>(30)

    const loadData = useCallback(async (days: DateRange) => {
        setLoading(true)
        try {
            const res = await fetch(`/api/admin/analytics?days=${days}`)
            if (res.ok) {
                const json = await res.json()
                setData(json)
            }
        } catch (error) {
            console.error('Failed to load analytics', error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadData(range)
    }, [range, loadData])

    function handleRangeChange(days: DateRange) {
        setRange(days)
    }

    if (loading && !data) {
        return <div className={styles.loading}>Loading analytics...</div>
    }

    if (!data) {
        return <div className={styles.emptyState}>Failed to load analytics data.</div>
    }

    const { summary, engagementTimeline, lessonPerformance, scenarioAnalysis, riskDistribution, departmentLeaderboard } = data

    // Build pie data from riskDistribution
    const pieData = Object.entries(riskDistribution).map(([key, value]) => ({
        name: RISK_LABELS[key] || key,
        value,
        color: RISK_COLORS[key] || '#94a3b8',
    }))

    return (
        <div className={styles.container}>
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <h1 className={styles.headerTitle}>Analytics</h1>
                    <p className={styles.headerSub}>
                        Platform engagement, content performance, and compliance insights
                    </p>
                </div>
                <div className={styles.dateFilters}>
                    {([7, 30, 90] as DateRange[]).map((d) => (
                        <button
                            key={d}
                            className={`${styles.dateBtn} ${range === d ? styles.dateBtnActive : ''}`}
                            onClick={() => handleRangeChange(d)}
                        >
                            {d}d
                        </button>
                    ))}
                </div>
            </header>

            {/* Summary Stats */}
            <div className={styles.statsGrid}>
                <StatCard
                    label="XP Earned"
                    value={summary.periodXP.toLocaleString()}
                    sub={`in the last ${range} days`}
                    icon={<Zap size={14} />}
                    iconBg="hsl(45 93% 47% / 0.1)"
                    iconColor="hsl(45 93% 47%)"
                />
                <StatCard
                    label="New Completions"
                    value={summary.newCompletions}
                    sub="lessons completed"
                    icon={<CheckCircle size={14} />}
                    iconBg="hsl(142 76% 36% / 0.1)"
                    iconColor="#10B981"
                />
                <StatCard
                    label="Active Days"
                    value={summary.activeDays}
                    sub={`of ${range} days had activity`}
                    icon={<TrendingUp size={14} />}
                    iconBg="hsl(210 80% 50% / 0.1)"
                    iconColor="hsl(210 80% 50%)"
                />
                <StatCard
                    label="Optimal Decisions"
                    value={`${summary.overallOptimalRate}%`}
                    sub={`across ${summary.totalScenarioResponses} responses`}
                    icon={<Target size={14} />}
                    iconBg="hsl(270 60% 50% / 0.1)"
                    iconColor="hsl(270 60% 50%)"
                />
            </div>

            {/* Engagement Timeline (Full Width) */}
            <div className={styles.chartCard}>
                <div className={styles.chartCardHeader}>
                    <div>
                        <h3 className={styles.chartCardTitle}>Engagement Over Time</h3>
                        <span className={styles.chartCardSub}>Daily XP earned and active learners</span>
                    </div>
                    <div className={styles.legend}>
                        <span className={styles.legendItem}>
                            <span className={styles.legendDot} style={{ background: 'hsl(210 80% 50%)' }} />
                            XP Earned
                        </span>
                        <span className={styles.legendItem}>
                            <span className={styles.legendDot} style={{ background: 'hsl(142 76% 36%)' }} />
                            Active Users
                        </span>
                    </div>
                </div>
                <div className={styles.chartBody}>
                    {engagementTimeline.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={engagementTimeline}>
                                <defs>
                                    <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(210 80% 50%)" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="hsl(210 80% 50%)" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(142 76% 36%)" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="hsl(142 76% 36%)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={formatShortDate}
                                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                                    interval="preserveStartEnd"
                                />
                                <YAxis
                                    yAxisId="xp"
                                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                                />
                                <YAxis
                                    yAxisId="users"
                                    orientation="right"
                                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: 'hsl(var(--card))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '8px',
                                        fontSize: '0.82rem',
                                    }}
                                    labelFormatter={(label: any) => formatShortDate(String(label))}
                                />
                                <Area
                                    yAxisId="xp"
                                    type="monotone"
                                    dataKey="xp"
                                    name="XP Earned"
                                    stroke="hsl(210 80% 50%)"
                                    fill="url(#xpGradient)"
                                    strokeWidth={2}
                                />
                                <Area
                                    yAxisId="users"
                                    type="monotone"
                                    dataKey="activeUsers"
                                    name="Active Users"
                                    stroke="hsl(142 76% 36%)"
                                    fill="url(#userGradient)"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className={styles.emptyState}>No engagement data for this period.</div>
                    )}
                </div>
            </div>

            {/* Two Column: Content Performance + Scenarios */}
            <div className={styles.twoColumn}>
                {/* Lesson Performance */}
                <div className={styles.chartCard}>
                    <div className={styles.chartCardHeader}>
                        <div>
                            <h3 className={styles.chartCardTitle}>Content Performance</h3>
                            <span className={styles.chartCardSub}>Completion rates per lesson (lowest first)</span>
                        </div>
                        <BookOpen size={16} style={{ color: 'hsl(var(--muted-foreground))' }} />
                    </div>
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {lessonPerformance.length > 0 ? (
                            <table className={styles.perfTable}>
                                <thead>
                                    <tr>
                                        <th>Lesson</th>
                                        <th>Completion</th>
                                        <th>Done</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lessonPerformance.map((lesson) => (
                                        <tr key={lesson.id}>
                                            <td>
                                                <span className={styles.lessonTitle}>{lesson.title}</span>
                                            </td>
                                            <td>
                                                <div className={styles.completionCell}>
                                                    <div className={styles.completionBarTrack}>
                                                        <div
                                                            className={styles.completionBarFill}
                                                            style={{
                                                                width: `${lesson.completionRate}%`,
                                                                background: getCompletionColor(lesson.completionRate),
                                                            }}
                                                        />
                                                    </div>
                                                    <span className={styles.completionPercent}>
                                                        {lesson.completionRate}%
                                                    </span>
                                                </div>
                                            </td>
                                            <td style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>
                                                {lesson.completedCount}/{lesson.totalLearners}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className={styles.emptyState}>No lesson data available.</div>
                        )}
                    </div>
                </div>

                {/* Scenario Analysis */}
                <div className={styles.chartCard}>
                    <div className={styles.chartCardHeader}>
                        <div>
                            <h3 className={styles.chartCardTitle}>Scenario Decisions</h3>
                            <span className={styles.chartCardSub}>Optimal choice rate by scenario</span>
                        </div>
                        <Shield size={16} style={{ color: 'hsl(var(--muted-foreground))' }} />
                    </div>
                    <div className={styles.chartBody}>
                        {scenarioAnalysis.length > 0 ? (
                            <div className={styles.scenarioList}>
                                {scenarioAnalysis.map((s) => (
                                    <div key={s.id} className={styles.scenarioItem}>
                                        <div className={styles.scenarioInfo}>
                                            <span className={styles.scenarioTitle}>{s.title}</span>
                                            <span className={styles.scenarioMeta}>
                                                <span className={`${styles.riskBadge} ${getRiskClass(s.riskLevel)}`}>
                                                    {s.riskLevel}
                                                </span>
                                                {' '}{s.totalResponses} responses
                                            </span>
                                        </div>
                                        <div className={styles.scenarioRate}>
                                            <span
                                                className={styles.scenarioRateValue}
                                                style={{ color: s.optimalRate >= 60 ? '#16a34a' : '#dc2626' }}
                                            >
                                                {s.optimalRate}%
                                            </span>
                                            <span className={styles.scenarioRateLabel}>optimal</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className={styles.emptyState}>No scenario response data yet.</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Two Column: Risk Distribution + Department Leaderboard */}
            <div className={styles.twoColumn}>
                {/* Risk Distribution Pie */}
                <div className={styles.chartCard}>
                    <div className={styles.chartCardHeader}>
                        <div>
                            <h3 className={styles.chartCardTitle}>Risk Level Distribution</h3>
                            <span className={styles.chartCardSub}>Scenario responses by risk category</span>
                        </div>
                    </div>
                    <div className={styles.chartBody}>
                        {pieData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={95}
                                        paddingAngle={3}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={index} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            background: 'hsl(var(--card))',
                                            border: '1px solid hsl(var(--border))',
                                            borderRadius: '8px',
                                            fontSize: '0.82rem',
                                        }}
                                        formatter={(value: any) => [`${value} responses`, '']}
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        iconType="circle"
                                        formatter={(value) => (
                                            <span style={{ fontSize: '0.78rem', color: 'hsl(var(--foreground))' }}>
                                                {value}
                                            </span>
                                        )}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className={styles.emptyState}>No scenario data to visualise.</div>
                        )}
                    </div>
                </div>

                {/* Department Leaderboard */}
                <div className={styles.chartCard}>
                    <div className={styles.chartCardHeader}>
                        <div>
                            <h3 className={styles.chartCardTitle}>Department Leaderboard</h3>
                            <span className={styles.chartCardSub}>Ranked by average XP</span>
                        </div>
                        <Award size={16} style={{ color: 'hsl(var(--muted-foreground))' }} />
                    </div>
                    <div className={styles.chartBody}>
                        {departmentLeaderboard.length > 0 ? (
                            <div className={styles.deptList}>
                                {departmentLeaderboard.map((dept, i) => (
                                    <div key={dept.name} className={styles.deptItem}>
                                        <div className={styles.deptItemHeader}>
                                            <span className={styles.deptName}>
                                                {i === 0 ? '1st' : i === 1 ? '2nd' : i === 2 ? '3rd' : `${i + 1}th`}{' '}
                                                {dept.name}
                                            </span>
                                            <span className={styles.deptStat}>
                                                {dept.avgXP.toLocaleString()} avg XP
                                            </span>
                                        </div>
                                        <div className={styles.deptBarTrack}>
                                            <div
                                                className={styles.deptBarFill}
                                                style={{
                                                    width: `${dept.avgCompletion}%`,
                                                }}
                                            />
                                        </div>
                                        <div className={styles.deptMeta}>
                                            <span>{dept.learners} learner{dept.learners !== 1 ? 's' : ''}</span>
                                            <span>{dept.avgCompletion}% avg completion</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className={styles.emptyState}>No department data available.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

function StatCard({ label, value, sub, icon, iconBg, iconColor }: {
    label: string
    value: string | number
    sub?: string
    icon: React.ReactNode
    iconBg: string
    iconColor: string
}) {
    return (
        <div className={styles.statCard}>
            <div className={styles.statCardHeader}>
                <span className={styles.statCardLabel}>{label}</span>
                <div className={styles.statCardIcon} style={{ background: iconBg, color: iconColor }}>
                    {icon}
                </div>
            </div>
            <div className={styles.statCardValue}>{value}</div>
            {sub && <div className={styles.statCardSub}>{sub}</div>}
        </div>
    )
}
