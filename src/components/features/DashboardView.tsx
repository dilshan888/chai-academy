"use client"

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { StatCards } from './dashboard/StatCards'
import { LearningProgressCard } from './dashboard/LearningProgressCard'
import { RecommendedCourses } from './dashboard/RecommendedCourses'
import { AchievementsPanel } from './dashboard/AchievementsPanel'
import { LearningPathCard } from './dashboard/LearningPathCard'
import styles from './dashboard/dashboard.module.css'

export function DashboardView() {
    const { data: session } = useSession()
    const userName = session?.user?.name || 'User'
    const [gamificationEnabled, setGamificationEnabled] = useState(true)

    useEffect(() => {
        async function loadSettings() {
            try {
                const res = await fetch('/api/gamification/settings')
                if (res.ok) {
                    const data = await res.json()
                    setGamificationEnabled(data.globalGamificationEnabled)
                }
            } catch (e) {
                console.error('Failed to fetch settings', e)
            }
        }
        loadSettings()
    }, [])

    return (
        <div className={styles.dashboardGrid}>
            <div className={styles.mainColumn}>
                {/* Welcome */}
                <section className={styles.welcome}>
                    <h1 className={styles.welcomeTitle}>
                        Welcome back, {userName}
                    </h1>
                    <p className={styles.welcomeSub}>
                        Ready to continue your journey through the EU AI Act?
                    </p>
                </section>

                {/* Stat Cards: XP, Streak, Level */}
                {gamificationEnabled && <StatCards />}

                {/* Learning Progress */}
                <LearningProgressCard />

                {/* Recommended Courses */}
                <RecommendedCourses />
            </div>

            <div className={styles.sideColumn}>
                {/* Learning Path Overview */}
                <LearningPathCard />

                {/* Achievements Panel */}
                {gamificationEnabled && <AchievementsPanel />}
            </div>
        </div>
    )
}
