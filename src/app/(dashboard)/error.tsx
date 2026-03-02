'use client'

import { useEffect } from 'react'

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('Dashboard error:', error)
    }, [error])

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4rem 2rem',
            textAlign: 'center',
            gap: '1rem',
        }}>
            <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'hsl(0 72% 51% / 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                color: 'hsl(0 72% 51%)',
                marginBottom: '0.5rem',
            }}>
                !
            </div>
            <h2 style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                margin: 0,
                color: 'hsl(var(--foreground))',
            }}>
                Something went wrong
            </h2>
            <p style={{
                fontSize: '0.9rem',
                color: 'hsl(var(--muted-foreground))',
                margin: 0,
                maxWidth: '400px',
                lineHeight: 1.5,
            }}>
                An unexpected error occurred while loading this page.
                Please try again or contact support if the problem persists.
            </p>
            <button
                onClick={reset}
                style={{
                    marginTop: '0.5rem',
                    padding: '0.6rem 1.5rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'hsl(var(--primary))',
                    color: 'hsl(var(--primary-foreground))',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'opacity 0.15s',
                }}
                onMouseOver={e => (e.currentTarget.style.opacity = '0.9')}
                onMouseOut={e => (e.currentTarget.style.opacity = '1')}
            >
                Try again
            </button>
        </div>
    )
}
