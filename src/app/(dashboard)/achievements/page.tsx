import { Card } from '@/components/ui/card'
import { Trophy } from 'lucide-react'

export default function AchievementsPage() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem' }}>
            <Card style={{ padding: '3rem', textAlign: 'center', maxWidth: '480px' }}>
                <Trophy size={48} style={{ color: 'hsl(var(--accent))', marginBottom: '1rem' }} />
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    Achievements & Leaderboards
                </h1>
                <p style={{ color: 'hsl(var(--muted-foreground))', lineHeight: 1.5 }}>
                    Track your milestones, earn badges, and see how your department ranks.
                    This feature is coming soon.
                </p>
            </Card>
        </div>
    )
}
