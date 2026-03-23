"use client"

import { ReactNode, useState } from 'react'
import { usePathname } from 'next/navigation'
import styles from './layout.module.css'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { ChatWidget } from '@/components/features/ChatWidget'
import { XPNotificationContainer } from '@/components/ui/XPNotification'

export function DashboardLayout({ children }: { children: ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const pathname = usePathname()

    const isCoursePage = pathname.startsWith('/courses') || 
                         pathname.startsWith('/lesson') || 
                         pathname.startsWith('/scenario')

    return (
        <div className={styles.dashboardContainer}>
            <div className={styles.sidebarArea}>
                <Sidebar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />
            </div>
            <Header onMenuToggle={() => setSidebarOpen((prev) => !prev)} />
            <main id="main-content" className={styles.main}>
                {children}
                {isCoursePage && (
                    <footer className={styles.globalFooter}>
                        <p>
                            This content is adapted from KI-Campus materials (EU AI Act Essentials),
                            licensed under CC BY-SA 4.0.
                        </p>
                    </footer>
                )}
            </main>
            <ChatWidget />
            <XPNotificationContainer />
        </div>
    )
}
