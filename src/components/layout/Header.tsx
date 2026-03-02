"use client"

import { Menu } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { NotificationBell } from './NotificationBell'
import styles from './header.module.css'

interface HeaderProps {
    onMenuToggle: () => void
}

export function Header({ onMenuToggle }: HeaderProps) {
    return (
        <header className={styles.header}>
            <div className={styles.left}>
                <button
                    className={styles.menuButton}
                    onClick={onMenuToggle}
                    aria-label="Toggle menu"
                >
                    <Menu size={22} />
                </button>
            </div>
            <div className={styles.right}>
                <ThemeToggle />
                <NotificationBell />
            </div>
        </header>
    )
}
