"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function RegisterPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        expertiseLevel: 'beginner',
        gamificationOptIn: true
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // Map the UI state to what the API expects
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    learningPace: formData.expertiseLevel,
                    gamificationOptIn: formData.gamificationOptIn
                })
            })

            if (res.ok) {
                // Success! Redirect to login
                router.push('/login?registered=true')
            } else {
                const data = await res.json()
                setError(data.error || 'Registration failed')
            }
        } catch (err) {
            setError('An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'hsl(var(--background))',
            padding: '2rem'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '450px',
                padding: '2rem',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                background: 'hsl(var(--card))'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Create Account</h1>
                    <p style={{ color: 'hsl(var(--foreground)/0.6)', fontSize: '0.95rem' }}>Join ChAI Academy today</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Preferred Name</label>
                        <input
                            type="text"
                            required
                            placeholder="How should we call you?"
                            value={formData.name}
                            autoComplete="name"
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--background))' }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Email Address</label>
                        <input
                            type="email"
                            required
                            placeholder="name@university.edu"
                            value={formData.email}
                            autoComplete="email"
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--background))' }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Password</label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            placeholder="Min. 6 characters"
                            value={formData.password}
                            autoComplete="new-password"
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--background))' }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Your AI Expertise Level</label>
                        <p style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', marginTop: '-0.25rem', marginBottom: '0.25rem' }}>
                            We use this to customize your onboarding path.
                        </p>
                        <select
                            value={formData.expertiseLevel}
                            onChange={e => setFormData({ ...formData, expertiseLevel: e.target.value })}
                            style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--background))', cursor: 'pointer' }}
                        >
                            <option value="beginner">Beginner (New to AI)</option>
                            <option value="intermediate">Intermediate (Use AI occasionally)</option>
                            <option value="advanced">Advanced (Understand AI Governance & Risks)</option>
                        </select>
                    </div>

                    <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.75rem',
                        marginTop: '0.5rem',
                        padding: '1rem',
                        background: 'hsl(var(--muted)/0.3)',
                        borderRadius: '8px',
                        border: '1px solid hsl(var(--border))'
                    }}>
                        <input
                            type="checkbox"
                            id="gamificationOptIn"
                            checked={formData.gamificationOptIn}
                            onChange={e => setFormData({ ...formData, gamificationOptIn: e.target.checked })}
                            style={{ marginTop: '0.2rem', width: '1.2rem', height: '1.2rem', cursor: 'pointer', accentColor: 'hsl(var(--primary))' }}
                        />
                        <label htmlFor="gamificationOptIn" style={{ fontSize: '0.875rem', lineHeight: '1.4', cursor: 'pointer' }}>
                            <span style={{ fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>Enable Gamification (Recommended)</span>
                            <span style={{ color: 'hsl(var(--muted-foreground))' }}>Earn points, unlock achievements, and see your progress on leaderboards to make learning more fun. You can change this later.</span>
                        </label>
                    </div>

                    {error && (
                        <div style={{ padding: '0.75rem', background: '#fee2e2', color: '#991b1b', borderRadius: '6px', fontSize: '0.875rem' }}>
                            {error}
                        </div>
                    )}

                    <Button type="submit" disabled={loading} style={{ marginTop: '1rem', width: '100%', padding: '1.5rem', fontSize: '1rem' }}>
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </Button>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.95rem' }}>
                    Already have an account?{' '}
                    <Link href="/login" style={{ color: 'hsl(var(--primary))', fontWeight: 600, textDecoration: 'none' }}>
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    )
}
