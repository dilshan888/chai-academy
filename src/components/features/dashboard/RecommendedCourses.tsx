"use client"

import { Clock, Zap } from 'lucide-react'
import styles from './dashboard.module.css'

const COURSES = [
    {
        id: 1,
        title: 'EU AI Act Overview',
        description: 'A comprehensive look at the upcoming regulations and compliance milestones.',
        duration: '45 mins',
        xp: 500,
        badge: 'Module 1',
        gradient: 'linear-gradient(135deg, #7a1d38 0%, #9d2447 50%, #4a0e22 100%)',
    },
    {
        id: 2,
        title: 'AI Ethics in Research',
        description: 'Practical guidelines for researchers working with large language models.',
        duration: '60 mins',
        xp: 750,
        badge: 'Elective',
        gradient: 'linear-gradient(135deg, #374151 0%, #4b5563 50%, #1f2937 100%)',
    },
]

export function RecommendedCourses() {
    return (
        <div className={styles.recommendedSection}>
            <div className={styles.recommendedHeader}>
                <h2 className={styles.recommendedTitle}>Recommended for You</h2>
                <a href="/courses" className={styles.recommendedViewAll}>View all</a>
            </div>
            <div className={styles.recommendedGrid}>
                {COURSES.map((course) => (
                    <div key={course.id} className={styles.courseCard}>
                        <div
                            className={styles.courseCardImage}
                            style={{ background: course.gradient }}
                        >
                            <span className={styles.courseCardBadge}>{course.badge}</span>
                        </div>
                        <div className={styles.courseCardBody}>
                            <h3 className={styles.courseCardTitle}>{course.title}</h3>
                            <p className={styles.courseCardDesc}>{course.description}</p>
                            <div className={styles.courseCardMeta}>
                                <span className={styles.courseCardMetaItem}>
                                    <Clock size={13} />
                                    {course.duration}
                                </span>
                                <span className={styles.courseCardMetaItem}>
                                    <Zap size={13} />
                                    {course.xp} XP
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
