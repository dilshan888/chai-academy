"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { Bell, Check, CheckCheck, BookOpen, Trophy, Flame, ArrowUp, Info } from 'lucide-react'
import styles from './header.module.css'

interface Notification {
    id: string
    title: string
    message: string
    type: 'LESSON_COMPLETE' | 'LEVEL_UP' | 'BADGE_EARNED' | 'STREAK_MILESTONE' | 'SYSTEM'
    read: boolean
    createdAt: string
}

export function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await fetch('/api/notifications?limit=20')
            if (!res.ok) return
            const data = await res.json()
            setNotifications(data.notifications)
            setUnreadCount(data.unreadCount)
        } catch {
            // Silently fail — notifications are non-critical
        }
    }, [])

    // Fetch on mount and poll every 30 seconds
    useEffect(() => {
        fetchNotifications()
        const interval = setInterval(fetchNotifications, 30000)
        return () => clearInterval(interval)
    }, [fetchNotifications])

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isOpen])

    const handleToggle = () => {
        setIsOpen((prev) => !prev)
    }

    const markAllRead = async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ markAllRead: true }),
            })
            if (res.ok) {
                setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
                setUnreadCount(0)
            }
        } catch {
            // Silently fail
        } finally {
            setIsLoading(false)
        }
    }

    const markOneRead = async (id: string) => {
        try {
            const res = await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notificationIds: [id] }),
            })
            if (res.ok) {
                const data = await res.json()
                setNotifications((prev) =>
                    prev.map((n) => (n.id === id ? { ...n, read: true } : n))
                )
                setUnreadCount(data.unreadCount)
            }
        } catch {
            // Silently fail
        }
    }

    const getIcon = (type: Notification['type']) => {
        switch (type) {
            case 'LESSON_COMPLETE':
                return <BookOpen size={16} />
            case 'LEVEL_UP':
                return <ArrowUp size={16} />
            case 'BADGE_EARNED':
                return <Trophy size={16} />
            case 'STREAK_MILESTONE':
                return <Flame size={16} />
            case 'SYSTEM':
            default:
                return <Info size={16} />
        }
    }

    const getTypeClass = (type: Notification['type']) => {
        switch (type) {
            case 'LESSON_COMPLETE':
                return styles.notifIconLesson
            case 'LEVEL_UP':
                return styles.notifIconLevel
            case 'BADGE_EARNED':
                return styles.notifIconBadge
            case 'STREAK_MILESTONE':
                return styles.notifIconStreak
            default:
                return styles.notifIconSystem
        }
    }

    const timeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime()
        const minutes = Math.floor(diff / 60000)
        if (minutes < 1) return 'just now'
        if (minutes < 60) return `${minutes}m ago`
        const hours = Math.floor(minutes / 60)
        if (hours < 24) return `${hours}h ago`
        const days = Math.floor(hours / 24)
        if (days < 7) return `${days}d ago`
        return new Date(dateStr).toLocaleDateString()
    }

    return (
        <div className={styles.notifWrapper} ref={dropdownRef}>
            <button
                className={styles.notifButton}
                onClick={handleToggle}
                aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className={styles.notifBadge}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className={styles.notifDropdown}>
                    <div className={styles.notifHeader}>
                        <span className={styles.notifTitle}>Notifications</span>
                        {unreadCount > 0 && (
                            <button
                                className={styles.notifMarkAll}
                                onClick={markAllRead}
                                disabled={isLoading}
                            >
                                <CheckCheck size={14} />
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className={styles.notifList}>
                        {notifications.length === 0 ? (
                            <div className={styles.notifEmpty}>
                                <Bell size={24} />
                                <p>No notifications yet</p>
                                <span>Complete lessons to earn achievements!</span>
                            </div>
                        ) : (
                            notifications.map((n) => (
                                <div
                                    key={n.id}
                                    className={`${styles.notifItem} ${!n.read ? styles.notifItemUnread : ''}`}
                                    onClick={() => !n.read && markOneRead(n.id)}
                                >
                                    <div className={`${styles.notifItemIcon} ${getTypeClass(n.type)}`}>
                                        {getIcon(n.type)}
                                    </div>
                                    <div className={styles.notifItemContent}>
                                        <span className={styles.notifItemTitle}>{n.title}</span>
                                        <span className={styles.notifItemMessage}>{n.message}</span>
                                        <span className={styles.notifItemTime}>{timeAgo(n.createdAt)}</span>
                                    </div>
                                    {!n.read && (
                                        <div className={styles.notifItemDot} />
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
