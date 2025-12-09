"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import styles from './forms.module.css'

export function OnboardingForm() {
    const router = useRouter()

    const [role, setRole] = useState('')
    const [experience, setExperience] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        router.push('/dashboard')
    }

    return (
        <form onSubmit={handleSubmit} className={styles.formStack}>
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    Personalize your path
                </h2>
                <p style={{ color: 'hsl(var(--foreground) / 0.6)', fontSize: '0.875rem' }}>
                    Help us tailor the content to your role
                </p>
            </div>

            <div className={styles.field}>
                <label>What is your primary role?</label>
                <select
                    className={styles.input}
                    required
                    value={role}
                    onChange={e => setRole(e.target.value)}
                >
                    <option value="">Select a role...</option>
                    <option value="admin">Administrator / HR</option>
                    <option value="staff">Administrative Staff</option>
                    <option value="faculty">Faculty Support</option>
                    <option value="other">Other</option>
                </select>
            </div>

            <div className={styles.field}>
                <label>How familiar are you with AI?</label>
                <select
                    className={styles.input}
                    required
                    value={experience}
                    onChange={e => setExperience(e.target.value)}
                >
                    <option value="">Select experience level...</option>
                    <option value="novice">I'm new to it</option>
                    <option value="intermediate">I use it sometimes</option>
                    <option value="expert">I'm very confident</option>
                </select>
            </div>

            <Button type="submit" fullWidth>
                Start Learning
            </Button>
        </form>
    )
}
