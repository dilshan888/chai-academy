"use client"

import { useState } from 'react'
import { Layout, Layers, BookOpen } from 'lucide-react'
import { PhaseManagementView } from './PhaseManagementView'
import { ModuleManagementView } from './ModuleManagementView'
import { LessonManagementView } from './LessonManagementView'
import styles from './admin/content-manager.module.css'

type TabType = 'phases' | 'modules' | 'lessons'

export function ContentManager() {
    const [activeTab, setActiveTab] = useState<TabType>('lessons')

    return (
        <div className={styles.container}>
            <div className={styles.tabsHeader}>
                <button
                    className={`${styles.tabButton} ${activeTab === 'phases' ? styles.tabButtonActive : ''}`}
                    onClick={() => setActiveTab('phases')}
                >
                    <Layout size={18} />
                    Phases
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === 'modules' ? styles.tabButtonActive : ''}`}
                    onClick={() => setActiveTab('modules')}
                >
                    <Layers size={18} />
                    Modules
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === 'lessons' ? styles.tabButtonActive : ''}`}
                    onClick={() => setActiveTab('lessons')}
                >
                    <BookOpen size={18} />
                    Lessons
                </button>
            </div>

            <div className={styles.tabContent}>
                {activeTab === 'phases' && <PhaseManagementView showHeader={false} />}
                {activeTab === 'modules' && <ModuleManagementView showHeader={false} />}
                {activeTab === 'lessons' && <LessonManagementView showHeader={false} />}
            </div>
        </div>
    )
}
