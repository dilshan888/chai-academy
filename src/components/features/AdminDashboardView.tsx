"use client"

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ProgressBar } from '@/components/ui/progress-bar'

interface AdminUser {
    id: string
    name: string
    email: string
    role: string
    progress: number
}

// const USERS = [...] // Removing static data logic


export function AdminDashboardView() {
    const [users, setUsers] = useState<AdminUser[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadUsers() {
            try {
                const res = await fetch('/api/admin/users')
                if (res.ok) {
                    const data = await res.json()
                    setUsers(data)
                }
            } catch (error) {
                console.error("Failed to load users", error)
            } finally {
                setLoading(false)
            }
        }
        loadUsers()
    }, [])

    const handleExport = () => {
        const csvContent = "data:text/csv;charset=utf-8,"
            + "ID,Name,Email,Role,Progress\n"
            + users.map(u => `${u.id},${u.name},${u.email},${u.role},${u.progress}%`).join("\n")
        // ...

        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", "chai_academy_report.csv")
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                        Admin Dashboard
                    </h1>
                    <p style={{ color: 'hsl(var(--foreground) / 0.7)' }}>
                        Overview of learner progress
                    </p>
                </div>
                <Button onClick={handleExport}>Export Report</Button>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <Card>
                    <div style={{ fontSize: '0.875rem', color: 'hsl(var(--foreground)/0.6)' }}>Total Learners</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700 }}>{users.length}</div>
                </Card>
                <Card>
                    <div style={{ fontSize: '0.875rem', color: 'hsl(var(--foreground)/0.6)' }}>Avg. Completion</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700 }}>
                        {users.length > 0
                            ? Math.round(users.reduce((acc, u) => acc + u.progress, 0) / users.length)
                            : 0}%
                    </div>
                </Card>
                <Card>
                    <div style={{ fontSize: '0.875rem', color: 'hsl(var(--foreground)/0.6)' }}>Certified</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700 }}>
                        {users.filter(u => u.progress === 100).length}
                    </div>
                </Card>
            </div>

            <Card>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', minWidth: '600px' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid hsl(var(--border))', textAlign: 'left' }}>
                                <th style={{ padding: '1rem', fontWeight: 600 }}>Name</th>
                                <th style={{ padding: '1rem', fontWeight: 600 }}>Role</th>
                                <th style={{ padding: '1rem', fontWeight: 600 }}>Progress</th>
                                <th style={{ padding: '1rem', fontWeight: 600 }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontWeight: 500 }}>{user.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'hsl(var(--foreground)/0.5)' }}>{user.email}</div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>{user.role}</td>
                                    <td style={{ padding: '1rem', width: '200px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <ProgressBar progress={user.progress} />
                                            <span style={{ fontSize: '0.8rem', width: '30px' }}>{user.progress}%</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        {user.progress === 100 ? (
                                            <span style={{ color: '#15803d', background: '#dcfce7', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>Certified</span>
                                        ) : (
                                            <span style={{ color: '#c2410c', background: '#ffedd5', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>In Progress</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    )
}
