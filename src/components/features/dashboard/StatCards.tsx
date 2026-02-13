"use client"

import { Zap, Flame, Shield } from 'lucide-react'
import { useProgress } from '@/lib/ProgressContext'
import styles from './dashboard.module.css'

export function StatCards() {
    const { stats } = useProgress()

    return (
        <div className={styles.statCardsRow}>
            {/* Total XP */}
            <div className={styles.statCard}>
                <div className={styles.statCardHeader}>
                    <span className={styles.statCardLabel}>Total XP</span>
                    <div className={styles.statCardIcon} style={{ background: 'hsl(142 76% 36% / 0.1)' }}>
                        <Zap size={16} style={{ color: '#10B981' }} />
                    </div>
                </div>
                <div className={styles.statCardValue}>
                    {stats.totalXP.toLocaleString()}
                </div>
                <div className={styles.statCardSub} style={{ color: '#10B981' }}>
                    +{stats.todayXP} today
                </div>
            </div>

            {/* Daily Streak */}
            <div className={styles.statCard}>
                <div className={styles.statCardHeader}>
                    <span className={styles.statCardLabel}>Daily Streak</span>
                    <div className={styles.statCardIcon} style={{ background: 'hsl(25 95% 53% / 0.1)' }}>
                        <Flame size={16} style={{ color: '#F97316' }} />
                    </div>
                </div>
                <div className={styles.statCardValue}>
                    {stats.currentStreak} {stats.currentStreak === 1 ? 'Day' : 'Days'}
                </div>
                <div className={styles.statCardSub} style={{ color: '#F97316' }}>
                    {stats.streakMultiplier > 1
                        ? `${stats.streakMultiplier.toFixed(1)}x multiplier active`
                        : 'Complete a lesson to start!'
                    }
                </div>
            </div>

            {/* Level */}
            <div className={styles.statCard}>
                <div className={styles.statCardHeader}>
                    <span className={styles.statCardLabel}>Level</span>
                    <div className={styles.statCardIcon} style={{ background: 'hsl(var(--accent) / 0.1)' }}>
                        <Shield size={16} style={{ color: 'hsl(var(--accent))' }} />
                    </div>
                </div>
                <div className={styles.statCardValue}>
                    Level {stats.level}
                </div>
                <div className={styles.statCardSub} style={{ color: 'hsl(var(--muted-foreground))' }}>
                    {stats.levelTitle}
                </div>
            </div>
        </div>
    )
}
