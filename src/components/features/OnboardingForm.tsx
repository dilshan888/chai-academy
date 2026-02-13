"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import styles from './forms.module.css'

const DEPARTMENTS = [
    'Computing',
    'Business',
    'Engineering',
    'Arts',
    'Sciences',
    'Law',
    'Education',
    'Health',
    'Other',
]

export function OnboardingForm() {
    const router = useRouter()

    const [role, setRole] = useState('')
    const [experience, setExperience] = useState('')
    const [department, setDepartment] = useState('')
    const [saving, setSaving] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            await fetch('/api/user', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jobTitle: role,
                    department,
                    onboardingComplete: true,
                }),
            })
            router.push('/dashboard')
        } catch {
            setSaving(false)
        }
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
                <label>What department are you in?</label>
                <select
                    className={styles.input}
                    required
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                >
                    <option value="">Select a department...</option>
                    {DEPARTMENTS.map(d => (
                        <option key={d} value={d}>{d}</option>
                    ))}
                </select>
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
                    <option value="Administrator / HR">Administrator / HR</option>
                    <option value="Administrative Staff">Administrative Staff</option>
                    <option value="Faculty Support">Faculty Support</option>
                    <option value="Other">Other</option>
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
                    <option value="novice">I&apos;m new to it</option>
                    <option value="intermediate">I use it sometimes</option>
                    <option value="expert">I&apos;m very confident</option>
                </select>
            </div>

            <Button type="submit" fullWidth disabled={saving}>
                {saving ? 'Saving...' : 'Start Learning'}
            </Button>
        </form>
    )
}
