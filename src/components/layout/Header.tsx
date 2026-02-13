"use client"

import { signOut } from 'next-auth/react'
import { Menu, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
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
                <Button
                    variant="secondary"
                    style={{ fontSize: '0.85rem', padding: '0.4rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}
                    onClick={() => signOut({ callbackUrl: '/login' })}
                >
                    <LogOut size={16} />
                    Logout
                </Button>
            </div>
        </header>
    )
}
