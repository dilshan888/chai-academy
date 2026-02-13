"use client"

import { useEffect } from 'react'
import { Zap } from 'lucide-react'
import { useProgress } from '@/lib/ProgressContext'
import styles from './xp-notification.module.css'

export function XPNotificationContainer() {
    const { xpNotifications, dismissXPNotification } = useProgress()

    // Auto-dismiss after 2.5s
    useEffect(() => {
        if (xpNotifications.length === 0) return

        const timers = xpNotifications.map((n) =>
            setTimeout(() => dismissXPNotification(n.id), 2500)
        )

        return () => timers.forEach(clearTimeout)
    }, [xpNotifications, dismissXPNotification])

    if (xpNotifications.length === 0) return null

    return (
        <div className={styles.container}>
            {xpNotifications.map((n) => (
                <div key={n.id} className={styles.toast}>
                    <div className={styles.icon}>
                        <Zap size={14} style={{ color: '#10B981' }} />
                    </div>
                    <span className={styles.amount}>+{n.amount} XP</span>
                    <span className={styles.reason}>{n.reason}</span>
                </div>
            ))}
        </div>
    )
}
