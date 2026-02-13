"use client"

import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
    LayoutDashboard,
    BookOpen,
    Trophy,
    Award,
    Beaker,
    Settings,
    GraduationCap,
} from 'lucide-react'
import styles from './sidebar.module.css'

interface SidebarProps {
    isOpen: boolean
    onClose: () => void
}

const NAV_ITEMS = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/courses', label: 'My Courses', icon: BookOpen },
    { href: '/achievements', label: 'Achievements', icon: Trophy },
    { href: '/certificates', label: 'Certificates', icon: Award },
    { href: '/research', label: 'Research Hub', icon: Beaker, disabled: true },
    { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname()
    const { data: session } = useSession()

    const userName = session?.user?.name || 'User'
    const initials = userName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)

    return (
        <>
            {isOpen && <div className={styles.overlay} onClick={onClose} />}
            <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
                <div className={styles.brand}>
                    <div className={styles.brandIcon}>
                        <GraduationCap size={20} />
                    </div>
                    <div className={styles.brandText}>
                        <span className={styles.brandName}>ChAI Academy</span>
                        <span className={styles.brandSub}>Staff Portal</span>
                    </div>
                </div>

                <nav className={styles.nav}>
                    {NAV_ITEMS.map((item) => {
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
                    <div className={styles.helpCard}>
                        <div className={styles.helpTitle}>Help Center</div>
                        <p className={styles.helpText}>
                            Stuck on a module? Our support team is here.
                        </p>
                        <button className={styles.helpButton}>Get Support</button>
                    </div>
                    <div className={styles.userInfo}>
                        <div className={styles.userAvatar}>{initials}</div>
                        <div className={styles.userDetails}>
                            <span className={styles.userName}>{userName}</span>
                            <span className={styles.userRole}>
                                {session?.user?.role === 'ADMIN' ? 'Administrator' : 'Staff Member'}
                            </span>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    )
}
