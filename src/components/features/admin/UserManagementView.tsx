"use client"

import { useEffect, useState } from 'react'
import {
    Users, Search, GraduationCap, TrendingUp, Award,
    Zap, Flame, Shield, ChevronDown, ChevronUp, Filter
} from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import styles from './user-management.module.css'

interface UserData {
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

interface DepartmentData {
    name: string
    count: number
    avgProgress: number
    totalXP: number
}

interface Stats {
    totalLearners: number
    avgCompletion: number
    certified: number
    avgXP: number
    activeLearners: number
}

type SortKey = 'name' | 'progress' | 'totalXP' | 'level' | 'currentStreak' | 'badgeCount'
type SortDir = 'asc' | 'desc'

export function UserManagementView() {
    const [users, setUsers] = useState<UserData[]>([])
    const [stats, setStats] = useState<Stats | null>(null)
    const [departments, setDepartments] = useState<DepartmentData[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    // Filter/search state
    const [search, setSearch] = useState('')
    const [deptFilter, setDeptFilter] = useState('')
    const [sortKey, setSortKey] = useState<SortKey>('progress')
    const [sortDir, setSortDir] = useState<SortDir>('desc')

    useEffect(() => {
        async function fetchUsers() {
            try {
                const res = await fetch('/api/admin/users')
                if (!res.ok) throw new Error('Failed to fetch')
                const data = await res.json()
                setUsers(data.users)
                setStats(data.stats)
                setDepartments(data.departments)
            } catch {
                setError('Failed to load user data')
            } finally {
                setLoading(false)
            }
        }
        fetchUsers()
    }, [])

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
        } else {
            setSortKey(key)
            setSortDir('desc')
        }
    }

    // Filtered + sorted users
    const filteredUsers = users
        .filter((u) => {
            const matchesSearch = search === '' ||
                u.name.toLowerCase().includes(search.toLowerCase()) ||
                u.email.toLowerCase().includes(search.toLowerCase())
            const matchesDept = deptFilter === '' || u.department === deptFilter
            return matchesSearch && matchesDept
        })
        .sort((a, b) => {
            const aVal = a[sortKey]
            const bVal = b[sortKey]
            if (typeof aVal === 'string' && typeof bVal === 'string') {
                return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
            }
            return sortDir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number)
        })

    const uniqueDepts = Array.from(new Set(users.map((u) => u.department))).sort()

    const timeAgo = (dateStr: string | null) => {
        if (!dateStr) return 'Never'
        const diff = Date.now() - new Date(dateStr).getTime()
        const minutes = Math.floor(diff / 60000)
        if (minutes < 1) return 'Just now'
        if (minutes < 60) return `${minutes}m ago`
        const hours = Math.floor(minutes / 60)
        if (hours < 24) return `${hours}h ago`
        const days = Math.floor(hours / 24)
        if (days < 7) return `${days}d ago`
        return new Date(dateStr).toLocaleDateString()
    }

    const SortIcon = ({ col }: { col: SortKey }) => {
        if (sortKey !== col) return null
        return sortDir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />
    }

    if (loading) {
        return <div className={styles.loading}>Loading user data...</div>
    }

    if (error) {
        return <div className={styles.loading}>{error}</div>
    }

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h1 className={styles.headerTitle}>User Management</h1>
                    <p className={styles.headerSub}>Monitor learner progress and engagement</p>
                </div>
            </div>

            {/* Stats Row */}
            {stats && (
                <div className={styles.statsRow}>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}><Users size={18} /></div>
                        <div className={styles.statValue}>{stats.totalLearners}</div>
                        <div className={styles.statLabel}>Total Learners</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}><TrendingUp size={18} /></div>
                        <div className={styles.statValue}>{stats.avgCompletion}%</div>
                        <div className={styles.statLabel}>Avg Completion</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}><GraduationCap size={18} /></div>
                        <div className={styles.statValue}>{stats.certified}</div>
                        <div className={styles.statLabel}>Fully Certified</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}><Flame size={18} /></div>
                        <div className={styles.statValue}>{stats.activeLearners}</div>
                        <div className={styles.statLabel}>Active (Streak)</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}><Zap size={18} /></div>
                        <div className={styles.statValue}>{stats.avgXP.toLocaleString()}</div>
                        <div className={styles.statLabel}>Avg XP</div>
                    </div>
                </div>
            )}

            {/* Main content: table + department sidebar */}
            <div className={styles.mainGrid}>
                {/* User Table */}
                <div className={styles.tableCard}>
                    <div className={styles.tableToolbar}>
                        <div className={styles.searchBox}>
                            <Search size={16} className={styles.searchIcon} aria-hidden="true" />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className={styles.searchInput}
                                aria-label="Search users"
                            />
                        </div>
                        <div className={styles.filterBox}>
                            <Filter size={14} aria-hidden="true" />
                            <select
                                value={deptFilter}
                                onChange={(e) => setDeptFilter(e.target.value)}
                                className={styles.filterSelect}
                                aria-label="Filter by department"
                            >
                                <option value="">All Departments</option>
                                {uniqueDepts.map((d) => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.tableCount}>
                            {filteredUsers.length} of {users.length} users
                        </div>
                    </div>

                    <div className={styles.tableScroll}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th className={styles.sortable} onClick={() => handleSort('progress')}>
                                        Progress <SortIcon col="progress" />
                                    </th>
                                    <th className={styles.sortable} onClick={() => handleSort('level')}>
                                        Level <SortIcon col="level" />
                                    </th>
                                    <th className={styles.sortable} onClick={() => handleSort('totalXP')}>
                                        XP <SortIcon col="totalXP" />
                                    </th>
                                    <th className={styles.sortable} onClick={() => handleSort('currentStreak')}>
                                        Streak <SortIcon col="currentStreak" />
                                    </th>
                                    <th className={styles.sortable} onClick={() => handleSort('badgeCount')}>
                                        Badges <SortIcon col="badgeCount" />
                                    </th>
                                    <th>Last Active</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className={styles.emptyRow}>
                                            No users found matching your search.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <tr key={user.id}>
                                            <td>
                                                <div className={styles.userCell}>
                                                    <Avatar name={user.name} size="sm" />
                                                    <div>
                                                        <div className={styles.userName}>{user.name}</div>
                                                        <div className={styles.userMeta}>
                                                            {user.email}
                                                            <span className={styles.deptBadge}>{user.department}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.progressCell}>
                                                    <div className={styles.progressBar}>
                                                        <div
                                                            className={`${styles.progressFill} ${user.progress === 100 ? styles.progressComplete : ''}`}
                                                            style={{ width: `${user.progress}%` }}
                                                        />
                                                    </div>
                                                    <span className={styles.progressText}>{user.progress}%</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.levelCell}>
                                                    <Shield size={13} aria-hidden="true" />
                                                    <span>{user.level}</span>
                                                    <span className={styles.levelTitle}>{user.levelTitle}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={styles.xpValue}>
                                                    <Zap size={13} aria-hidden="true" />
                                                    {user.totalXP.toLocaleString()}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`${styles.streakBadge} ${user.currentStreak > 0 ? styles.streakActive : styles.streakInactive}`}>
                                                    <Flame size={12} aria-hidden="true" />
                                                    {user.currentStreak}d
                                                </span>
                                            </td>
                                            <td>
                                                <span className={styles.badgeCount}>
                                                    <Award size={13} aria-hidden="true" />
                                                    {user.badgeCount}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={styles.lastActive}>{timeAgo(user.lastActive)}</span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Department Sidebar */}
                <div className={styles.deptSidebar}>
                    <h3 className={styles.deptTitle}>Departments</h3>
                    {departments.length === 0 ? (
                        <p className={styles.deptEmpty}>No department data yet.</p>
                    ) : (
                        <div className={styles.deptList}>
                            {departments.map((dept) => (
                                <button
                                    key={dept.name}
                                    className={`${styles.deptCard} ${deptFilter === dept.name ? styles.deptCardActive : ''}`}
                                    onClick={() => setDeptFilter(deptFilter === dept.name ? '' : dept.name)}
                                >
                                    <div className={styles.deptCardHeader}>
                                        <span className={styles.deptName}>{dept.name}</span>
                                        <span className={styles.deptCount}>{dept.count} {dept.count === 1 ? 'user' : 'users'}</span>
                                    </div>
                                    <div className={styles.deptProgressBar}>
                                        <div
                                            className={styles.deptProgressFill}
                                            style={{ width: `${dept.avgProgress}%` }}
                                        />
                                    </div>
                                    <div className={styles.deptStats}>
                                        <span>{dept.avgProgress}% avg</span>
                                        <span><Zap size={11} aria-hidden="true" /> {dept.totalXP.toLocaleString()} XP</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
