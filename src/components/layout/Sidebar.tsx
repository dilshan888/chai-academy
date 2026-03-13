"use client"

import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useEffect } from 'react'
import {
    LayoutDashboard,
    BookOpen,
    Trophy,
    Settings,
    GraduationCap,
    Users,
    BarChart3,
    FileText,
    LogOut,
    ClipboardList,
} from 'lucide-react'
import styles from './sidebar.module.css'

interface SidebarProps {
    isOpen: boolean
    onClose: () => void
}

interface NavItem {
    href: string
    label: string
    icon: React.ComponentType<{ className?: string; size?: number }>
    disabled?: boolean
    adminOnly?: boolean
    staffOnly?: boolean
}

const NAV_ITEMS: NavItem[] = [
    // Staff (Learner) items
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, staffOnly: true },
    { href: '/courses', label: 'My Courses', icon: BookOpen, staffOnly: true },
    { href: '/achievements', label: 'Achievements', icon: Trophy, staffOnly: true },
    { href: '/profile', label: 'Profile', icon: Settings, staffOnly: true },

    // Admin items
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, adminOnly: true },
    { href: '/admin/users', label: 'User Management', icon: Users, adminOnly: true },
    { href: '/admin/assessments', label: 'Assessment Results', icon: ClipboardList, adminOnly: true },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart3, adminOnly: true },
    { href: '/admin/lessons', label: 'Content Manager', icon: FileText, adminOnly: true },
    { href: '/admin/settings', label: 'Settings', icon: Settings, adminOnly: true },
]

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname()
    const { data: session } = useSession()

    // Close sidebar on Escape key
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                onClose()
            }
        }
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown)
        }
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, onClose])

    // Use pathname as primary role signal to avoid sidebar flash during session loading
    const isAdmin = pathname.startsWith('/admin')
        ? true
        : session?.user?.role === 'ADMIN'
    const userName = session?.user?.name || 'User'
    const initials = userName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)

    // Filter nav items by role
    const visibleItems = NAV_ITEMS.filter((item) => {
        if (isAdmin) return !item.staffOnly
        return !item.adminOnly
    })

    return (
        <>
            {isOpen && <div className={styles.overlay} onClick={onClose} aria-hidden="true" />}
            <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
                <div className={styles.brand}>
                    <div className={styles.brandIcon}>
                        <GraduationCap size={20} />
                    </div>
                    <div className={styles.brandText}>
                        <span className={styles.brandName}>ChAI Academy</span>
                        <span className={styles.brandSub}>
                            {isAdmin ? 'Admin Portal' : 'Staff Portal'}
                        </span>
                    </div>
                </div>

                <nav className={styles.nav}>
                    {visibleItems.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href
                        const isDisabled = item.disabled

                        return (
                            <a
                                key={item.href}
                                href={isDisabled ? undefined : item.href}
                                className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''} ${isDisabled ? styles.navLinkDisabled : ''}`}
                                onClick={isDisabled ? (e) => e.preventDefault() : onClose}
                            >
                                <Icon className={styles.navIcon} />
                                {item.label}
                                {isDisabled && <span className={styles.comingSoon}>Soon</span>}
                            </a>
                        )
                    })}
                </nav>

                <div className={styles.userSection}>
                    <div className={styles.userInfo}>
                        <div className={styles.userAvatar}>{initials}</div>
                        <div className={styles.userDetails}>
                            <span className={styles.userName}>{userName}</span>
                            <span className={styles.userRole}>
                                {isAdmin ? 'Administrator' : 'Staff Member'}
                            </span>
                        </div>
                    </div>
                    <button
                        className={styles.logoutButton}
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        aria-label="Logout"
                        title="Logout"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </aside>
        </>
    )
}
