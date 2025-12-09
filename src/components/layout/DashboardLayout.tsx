"use client" // Client component for Logout button interactivity if needed

import { ReactNode } from 'react'
import { signOut } from 'next-auth/react' // Import signOut
import styles from './layout.module.css'
import { Button } from '@/components/ui/button'

export function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <div className={styles.dashboardContainer}>
            <header className={styles.header}>
                <div style={{ fontWeight: 700, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: 'hsl(var(--accent))' }}>✦</span>
                    ChAI Academy
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <a href="/settings">
                        <Button
                            variant="secondary"
                            style={{ fontSize: '0.875rem', padding: '0.4rem 1rem' }}
                        >
                            Settings
                        </Button>
                    </a>
                    <Button
                        variant="secondary"
                        style={{ fontSize: '0.875rem', padding: '0.4rem 1rem' }}
                        onClick={() => signOut({ callbackUrl: '/login' })}
                    >
                        Logout
                    </Button>
                </div>
            </header>
            <main className={styles.main}>
                {children}
            </main>
        </div>
    )
}
