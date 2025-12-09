"use client" // Client component for Logout button interactivity if needed

import { ReactNode } from 'react'
import styles from './layout.module.css'
import { Button } from '@/components/ui/button'

export function DashboardLayout({ children }: { children: ReactNode }) {
    // Logic for logout (e.g. signOut()) would go here, via client component wrapping
    // For MVP layout, we'll just render Button.

    return (
        <div className={styles.dashboardContainer}>
            <header className={styles.header}>
                <div style={{ fontWeight: 700, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: 'hsl(var(--accent))' }}>✦</span>
                    ChAI Academy
                </div>
                <Button
                    variant="secondary"
                    style={{ fontSize: '0.875rem', padding: '0.4rem 1rem' }}
                    onClick={() => { console.log('Logout clicked') }}
                >
                    Logout
                </Button>
            </header>
            <main className={styles.main}>
                {children}
            </main>
        </div>
    )
}
