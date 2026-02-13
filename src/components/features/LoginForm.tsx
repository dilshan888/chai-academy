"use client"

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import styles from './forms.module.css'

export function LoginForm() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState('')
    // Password state for local testing, though MVP spec implies simple "Role" selection 
    // users might just need email login. But we added password field.
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        const res = await signIn('credentials', {
            redirect: false,
            email,
            password,
        })

        if (!res?.error) {
            // Check role to determine redirect
            const session = await getSession()
            if (session?.user?.role === 'ADMIN') {
                router.push('/admin')
            } else {
                router.push('/dashboard')
            }
        } else {
            setError('Invalid credentials')
        }
        setLoading(false)
    }

    return (
        <form onSubmit={handleSubmit} className={styles.formStack}>
            <div style={{ textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    Welcome Back
                </h2>
                <p style={{ color: 'hsl(var(--foreground) / 0.6)', fontSize: '0.875rem' }}>
                    Sign in to continue your progress
                </p>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.field}>
                <label>Email Address</label>
                <input
                    type="email"
                    required
                    className={styles.input}
                    value={email}
                    placeholder="admin@university.edu"
                    onChange={e => setEmail(e.target.value)}
                />
            </div>

            <div className={styles.field}>
                <label>Password</label>
                <input
                    type="password"
                    required
                    className={styles.input}
                    value={password}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    onChange={e => setPassword(e.target.value)}
                />
            </div>

            <Button type="submit" fullWidth disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
            </Button>

            <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>
                Don&apos;t have an account?{' '}
                <a href="/register" style={{ color: 'hsl(var(--primary))', fontWeight: 600, textDecoration: 'none' }}>
                    Sign up
                </a>
            </div>
        </form>
    )
}
