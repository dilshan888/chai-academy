"use client"

import { ReactNode, useState } from 'react'
import styles from './layout.module.css'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { ChatWidget } from '@/components/features/ChatWidget'
import { XPNotificationContainer } from '@/components/ui/XPNotification'

export function DashboardLayout({ children }: { children: ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className={styles.dashboardContainer}>
            <div className={styles.sidebarArea}>
                <Sidebar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />
            </div>
            <Header onMenuToggle={() => setSidebarOpen((prev) => !prev)} />
            <main className={styles.main}>
                {children}
            </main>
            <ChatWidget />
            <XPNotificationContainer />
        </div>
    )
}
