"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function RegisterPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({ name: '', email: '', password: '' })
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
                body: JSON.stringify(formData)
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
            background: 'hsl(var(--background))'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '400px',
                padding: '2rem',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                background: 'hsl(var(--card))'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Create Account</h1>
                    <p style={{ color: 'hsl(var(--foreground)/0.6)', fontSize: '0.9rem' }}>Join ChAI Academy today</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Full Name</label>
                        <input
                            type="text"
                            required
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--background))' }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Email</label>
                        <input
                            type="email"
                            required
                            placeholder="name@example.com"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--background))' }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Password</label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            placeholder="Min. 6 characters"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--background))' }}
                        />
                    </div>

                    {error && (
                        <div style={{ padding: '0.75rem', background: '#fee2e2', color: '#991b1b', borderRadius: '6px', fontSize: '0.875rem' }}>
                            {error}
                        </div>
                    )}

                    <Button type="submit" disabled={loading} style={{ marginTop: '1rem', width: '100%' }}>
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </Button>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
                    Already have an account?{' '}
                    <Link href="/login" style={{ color: 'hsl(var(--primary))', fontWeight: 500, textDecoration: 'none' }}>
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    )
}
