"use client"

import { useEffect, useState } from 'react'
import { Trophy, Lock } from 'lucide-react'
import styles from './dashboard.module.css'

interface AchievementDisplay {
    id: string
    slug: string
    title: string
    description: string
    iconEmoji: string
    unlocked: boolean
}

export function AchievementsPanel() {
    const [achievements, setAchievements] = useState<AchievementDisplay[]>([])

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch('/api/gamification/achievements')
                if (res.ok) {
                    const data = await res.json()
                    setAchievements(data.achievements?.slice(0, 3) || [])
                }
            } catch {
                // ignore
            }
        }
        load()
    }, [])

    if (achievements.length === 0) {
        return null
    }

    return (
        <div className={styles.achievementsPanel}>
            <div className={styles.achievementsPanelHeader}>
                <Trophy size={18} style={{ color: 'hsl(var(--accent))' }} />
                <h3 className={styles.achievementsPanelTitle}>Achievements</h3>
            </div>

            {achievements.map((a) => (
                <div key={a.id} className={styles.achievementItem}>
                    <div
                        className={`${styles.achievementIcon} ${a.unlocked ? styles.achievementIconUnlocked : styles.achievementIconLocked}`}
                    >
                        {a.unlocked ? a.iconEmoji : <Lock size={16} />}
                    </div>
                    <div className={styles.achievementInfo}>
                        <div className={styles.achievementName}>{a.title}</div>
                        <div className={styles.achievementDesc}>{a.description}</div>
                        <div
                            className={`${styles.achievementStatus} ${a.unlocked ? styles.achievementStatusUnlocked : styles.achievementStatusLocked}`}
                        >
                            {a.unlocked ? 'Unlocked' : 'Locked'}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
