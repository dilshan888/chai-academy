"use client"

import { useEffect, useState } from 'react'
import { Gamepad2, Info, Globe, Bell } from 'lucide-react'
import styles from './admin-settings.module.css'

interface SettingsState {
    GAMIFICATION_ENABLED: boolean
}

export function AdminSettingsView() {
    const [settings, setSettings] = useState<SettingsState>({
        GAMIFICATION_ENABLED: true,
    })
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState<string | null>(null)
    const [savedKey, setSavedKey] = useState<string | null>(null)

    useEffect(() => {
        async function loadSettings() {
            try {
                const res = await fetch('/api/admin/settings')
                if (res.ok) {
                    const data = await res.json()
                    setSettings({
                        GAMIFICATION_ENABLED: data['GAMIFICATION_ENABLED'] !== 'false',
                    })
                }
            } catch (error) {
                console.error('Failed to load settings', error)
            } finally {
                setLoading(false)
            }
        }
        loadSettings()
    }, [])

    async function updateSetting(key: string, value: string) {
        setUpdating(key)
        setSavedKey(null)
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [key]: value }),
            })
            if (res.ok) {
                setSavedKey(key)
                setTimeout(() => setSavedKey(null), 2000)
            }
        } catch (error) {
            console.error('Failed to update setting', error)
        } finally {
            setUpdating(null)
        }
    }

    function handleToggle(key: keyof SettingsState) {
        const newValue = !settings[key]
        setSettings(prev => ({ ...prev, [key]: newValue }))
        updateSetting(key, newValue ? 'true' : 'false')
    }

    if (loading) {
        return <div className={styles.loading}>Loading settings...</div>
    }

    return (
        <div className={styles.container}>
            {/* Header */}
            <header className={styles.header}>
                <h1 className={styles.headerTitle}>Settings</h1>
                <p className={styles.headerSub}>
                    Manage platform-wide configuration for ChAI Academy
                </p>
            </header>

            {/* Gamification & Engagement */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <div
                        className={styles.sectionIcon}
                        style={{ background: 'hsl(270 60% 50% / 0.1)', color: 'hsl(270 60% 50%)' }}
                    >
                        <Gamepad2 size={16} />
                    </div>
                    <h2 className={styles.sectionTitle}>Gamification & Engagement</h2>
                </div>
                <div className={styles.sectionBody}>
                    <div className={styles.settingRow}>
                        <div className={styles.settingInfo}>
                            <span className={styles.settingLabel}>
                                Enable Gamification
                                {' '}
                                <span className={`${styles.statusBadge} ${settings.GAMIFICATION_ENABLED ? styles.statusOn : styles.statusOff}`}>
                                    {settings.GAMIFICATION_ENABLED ? 'Active' : 'Disabled'}
                                </span>
                            </span>
                            <span className={styles.settingDescription}>
                                When enabled, learners earn XP, level up, maintain streaks, and unlock achievements.
                                Disabling this hides all gamification elements from the learner experience.
                            </span>
                        </div>
                        <label className={styles.toggle}>
                            <input
                                type="checkbox"
                                className={styles.toggleInput}
                                checked={settings.GAMIFICATION_ENABLED}
                                onChange={() => handleToggle('GAMIFICATION_ENABLED')}
                                disabled={updating === 'GAMIFICATION_ENABLED'}
                            />
                            <span className={styles.toggleTrack} />
                        </label>
                    </div>
                    {savedKey === 'GAMIFICATION_ENABLED' && (
                        <span className={styles.saveFeedback}>Setting saved successfully</span>
                    )}
                </div>
            </div>

            {/* Notifications (placeholder) */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <div
                        className={styles.sectionIcon}
                        style={{ background: 'hsl(210 80% 50% / 0.1)', color: 'hsl(210 80% 50%)' }}
                    >
                        <Bell size={16} />
                    </div>
                    <h2 className={styles.sectionTitle}>Notifications</h2>
                </div>
                <div className={styles.sectionBody}>
                    <div className={styles.settingRow}>
                        <div className={styles.settingInfo}>
                            <span className={styles.settingLabel}>Weekly Progress Emails</span>
                            <span className={styles.settingDescription}>
                                Automatically send learners a weekly summary of their progress, upcoming lessons, and streak status.
                            </span>
                        </div>
                        <label className={styles.toggle}>
                            <input
                                type="checkbox"
                                className={styles.toggleInput}
                                checked={true}
                                disabled
                            />
                            <span className={styles.toggleTrack} />
                        </label>
                    </div>
                    <div className={styles.infoBanner}>
                        <Info size={16} className={styles.infoBannerIcon} />
                        <span>Email notifications require SMTP configuration. This feature is coming soon.</span>
                    </div>
                </div>
            </div>

            {/* General / Platform (placeholder) */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <div
                        className={styles.sectionIcon}
                        style={{ background: 'hsl(var(--accent) / 0.15)', color: 'hsl(var(--primary))' }}
                    >
                        <Globe size={16} />
                    </div>
                    <h2 className={styles.sectionTitle}>Platform</h2>
                </div>
                <div className={styles.sectionBody}>
                    <div className={styles.settingRow}>
                        <div className={styles.settingInfo}>
                            <span className={styles.settingLabel}>Platform Name</span>
                            <span className={styles.settingDescription}>
                                The name displayed throughout the application and in email communications.
                            </span>
                        </div>
                        <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'hsl(var(--foreground))' }}>
                            ChAI Academy
                        </span>
                    </div>
                    <hr className={styles.divider} />
                    <div className={styles.settingRow}>
                        <div className={styles.settingInfo}>
                            <span className={styles.settingLabel}>Default Difficulty</span>
                            <span className={styles.settingDescription}>
                                The default difficulty level assigned to new lessons when none is specified.
                            </span>
                        </div>
                        <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'hsl(var(--foreground))' }}>
                            Beginner
                        </span>
                    </div>
                    <div className={styles.infoBanner}>
                        <Info size={16} className={styles.infoBannerIcon} />
                        <span>Platform configuration settings will be editable in a future update.</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
