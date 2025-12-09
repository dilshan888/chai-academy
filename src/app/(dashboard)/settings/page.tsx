"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function SettingsPage() {
    const { data: session, update } = useSession()
    const router = useRouter()

    const [name, setName] = useState(session?.user?.name || '')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState({ type: '', text: '' })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage({ type: '', text: '' })

        try {
            const res = await fetch('/api/user', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, password: password || undefined })
            })

            if (res.ok) {
                setMessage({ type: 'success', text: 'Profile updated successfully!' })
                // Update session
                await update({ name })
                setPassword('') // Clear password field
            } else {
                const data = await res.json()
                setMessage({ type: 'error', text: data.error || 'Failed to update' })
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An unexpected error occurred' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2rem' }}>
                Settings
            </h1>

            <Card style={{ padding: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', borderBottom: '1px solid hsl(var(--border))', paddingBottom: '0.5rem' }}>
                    Profile Security
                </h2>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your Name"
                            style={{
                                padding: '0.75rem',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '6px',
                                background: 'hsl(var(--background))'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                            New Password <span style={{ fontWeight: 400, color: 'hsl(var(--foreground)/0.5)' }}>(Leave blank to keep current)</span>
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Min. 6 characters"
                            style={{
                                padding: '0.75rem',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '6px',
                                background: 'hsl(var(--background))'
                            }}
                        />
                    </div>

                    {message.text && (
                        <div style={{
                            padding: '0.75rem',
                            borderRadius: '6px',
                            background: message.type === 'success' ? '#dcfce7' : '#fee2e2',
                            color: message.type === 'success' ? '#166534' : '#991b1b',
                            fontSize: '0.9rem'
                        }}>
                            {message.text}
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>

                </form>
            </Card>
        </div>
    )
}
