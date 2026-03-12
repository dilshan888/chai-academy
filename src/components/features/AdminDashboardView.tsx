"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Users, TrendingUp, Award, Zap, Flame, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProgressBar } from '@/components/ui/progress-bar'
import styles from './admin/admin-dashboard.module.css'

interface AdminUser {
    id: string
    name: string
    email: string
    department: string
    role: string
    progress: number
    totalXP: number
    level: number
    levelTitle: string
    currentStreak: number
    badgeCount: number
    lastActive: string | null
}

interface AdminStats {
    totalLearners: number
    avgCompletion: number
    certified: number
    avgXP: number
    activeLearners: number
}

interface DeptData {
    name: string
    count: number
    avgProgress: number
    totalXP: number
}

interface DashboardResponse {
    users: AdminUser[]
    stats: AdminStats
    departments: DeptData[]
}

export function AdminDashboardView() {
    const [data, setData] = useState<DashboardResponse | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadData() {
            try {
                const usersRes = await fetch('/api/admin/users')
                if (usersRes.ok) {
                    const json = await usersRes.json()
                    setData(json)
                }
            } catch (error) {
                console.error("Failed to load admin data", error)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [])

    const handleExport = () => {
        if (!data) return
        const csvContent = "data:text/csv;charset=utf-8,"
            + "Name,Email,Department,Progress,XP,Level,Streak,Badges\n"
            + data.users.map(u =>
                `"${u.name}","${u.email}","${u.department}",${u.progress}%,${u.totalXP},${u.level} - ${u.levelTitle},${u.currentStreak},${u.badgeCount}`
            ).join("\n")

        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", "chai_academy_report.csv")
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    if (loading) {
        return <div className={styles.loading}>Loading dashboard data...</div>
    }

    if (!data) {
        return <div className={styles.emptyState}>Failed to load dashboard data.</div>
    }

    const { users, stats, departments } = data

    return (
        <div className={styles.container}>
            {/* Header */}
            <header className={styles.header}>
                <div>
                    <h1 className={styles.headerTitle}>Admin Dashboard</h1>
                    <p className={styles.headerSub}>
                        Monitor learner progress, engagement, and gamification metrics
                    </p>
                </div>
                <div className={styles.headerActions}>
                    <Link href="/admin/lessons" style={{ textDecoration: 'none' }}>
                        <Button variant="primary">Create Lesson</Button>
                    </Link>
                    <Button onClick={handleExport} variant="secondary">Export Report</Button>
                </div>
            </header>

            {/* Stat Cards */}
            <div className={styles.statsGrid}>
                <StatCard
                    label="Total Learners"
                    value={stats.totalLearners}
                    icon={<Users size={14} aria-hidden="true" />}
                    iconBg="hsl(var(--accent) / 0.1)"
                    iconColor="hsl(var(--accent))"
                />
                <StatCard
                    label="Avg. Completion"
                    value={`${stats.avgCompletion}%`}
                    sub="of total lessons completed"
                    icon={<TrendingUp size={14} aria-hidden="true" />}
                    iconBg="hsl(210 80% 50% / 0.1)"
                    iconColor="hsl(210 80% 50%)"
                />
                <StatCard
                    label="Certified"
                    value={stats.certified}
                    sub={`of ${stats.totalLearners} learners`}
                    icon={<Award size={14} aria-hidden="true" />}
                    iconBg="hsl(142 76% 36% / 0.1)"
                    iconColor="#10B981"
                />
                <StatCard
                    label="Avg. XP"
                    value={stats.avgXP.toLocaleString()}
                    icon={<Zap size={14} aria-hidden="true" />}
                    iconBg="hsl(45 93% 47% / 0.1)"
                    iconColor="hsl(45 93% 47%)"
                />
                <StatCard
                    label="Active Learners"
                    value={stats.activeLearners}
                    sub="with active streaks"
                    icon={<Flame size={14} aria-hidden="true" />}
                    iconBg="hsl(25 95% 53% / 0.1)"
                    iconColor="hsl(25 95% 53%)"
                />
            </div>

            {/* Two Column: Table + Departments */}
            <div className={styles.twoColumn}>
                {/* User Table */}
                <div className={styles.tableCard}>
                    <div className={styles.tableHeader}>
                        <span className={styles.tableTitle}>Learner Overview</span>
                        <span className={styles.tableCount}>{users.length} learners</span>
                    </div>
                    <div className={styles.tableScroll}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th scope="col">Name</th>
                                    <th scope="col">Department</th>
                                    <th scope="col" title="Percentage of total lessons completed by this learner">Progress</th>
                                    <th scope="col">XP</th>
                                    <th scope="col">Level</th>
                                    <th scope="col">Streak</th>
                                    <th scope="col">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className={styles.emptyState}>
                                            No learners found
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user) => (
                                        <tr key={user.id}>
                                            <td>
                                                <div className={styles.userName}>{user.name}</div>
                                                <div className={styles.userEmail}>{user.email}</div>
                                            </td>
                                            <td>
                                                <span className={styles.userDept}>{user.department}</span>
                                            </td>
                                            <td>
                                                <div className={styles.progressCell}>
                                                    <ProgressBar progress={user.progress} />
                                                    <span className={styles.progressPercent}>{user.progress}%</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={styles.xpCell}>{user.totalXP.toLocaleString()}</span>
                                            </td>
                                            <td>
                                                <span className={styles.levelBadge}>
                                                    <Shield size={10} aria-hidden="true" />
                                                    L{user.level} {user.levelTitle}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={styles.streakCell}>
                                                    {user.currentStreak > 0 && <Flame size={12} style={{ color: 'hsl(25 95% 53%)' }} aria-hidden="true" />}
                                                    {user.currentStreak}d
                                                </span>
                                            </td>
                                            <td>
                                                {user.progress === 100 ? (
                                                    <span className={`${styles.statusBadge} ${styles.statusCertified}`}>Certified</span>
                                                ) : user.progress > 0 ? (
                                                    <span className={`${styles.statusBadge} ${styles.statusInProgress}`}>In Progress</span>
                                                ) : (
                                                    <span className={`${styles.statusBadge} ${styles.statusNotStarted}`}>Not Started</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Department Breakdown */}
                <div className={styles.deptCard}>
                    <h3 className={styles.deptCardTitle}>Department Breakdown</h3>
                    {departments.length === 0 ? (
                        <div className={styles.emptyState}>No department data</div>
                    ) : (
                        departments.map((dept) => (
                            <div key={dept.name} className={styles.deptItem}>
                                <div className={styles.deptItemHeader}>
                                    <span className={styles.deptName}>{dept.name}</span>
                                    <span className={styles.deptCount}>{dept.count} learners</span>
                                </div>
                                <div className={styles.deptBarTrack}>
                                    <div
                                        className={styles.deptBarFill}
                                        style={{ width: `${dept.avgProgress}%` }}
                                    />
                                </div>
                                <div className={styles.deptStats}>
                                    <span>Avg: {dept.avgProgress}%</span>
                                    <span>{dept.totalXP.toLocaleString()} XP</span>
                                </div>
                            </div>
                        ))
                    )}
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
