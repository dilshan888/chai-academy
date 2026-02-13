"use client"

import { useSession } from 'next-auth/react'
import { StatCards } from './dashboard/StatCards'
import { LearningProgressCard } from './dashboard/LearningProgressCard'
import { RecommendedCourses } from './dashboard/RecommendedCourses'
import { AchievementsPanel } from './dashboard/AchievementsPanel'
import styles from './dashboard/dashboard.module.css'

export function DashboardView() {
    const { data: session } = useSession()
    const userName = session?.user?.name || 'User'

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
                <StatCards />

                {/* Learning Progress */}
                <LearningProgressCard />

                {/* Recommended Courses */}
                <RecommendedCourses />
            </div>

            <div className={styles.sideColumn}>
                {/* Achievements Panel */}
                <AchievementsPanel />
            </div>
        </div>
    )
}
