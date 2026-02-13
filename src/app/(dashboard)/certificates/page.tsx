import { Card } from '@/components/ui/card'
import { Award } from 'lucide-react'

export default function CertificatesPage() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem' }}>
            <Card style={{ padding: '3rem', textAlign: 'center', maxWidth: '480px' }}>
                <Award size={48} style={{ color: 'hsl(var(--accent))', marginBottom: '1rem' }} />
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    Certificates
                </h1>
                <p style={{ color: 'hsl(var(--muted-foreground))', lineHeight: 1.5 }}>
                    Your earned certificates will appear here once you complete a course.
                    This feature is coming soon.
                </p>
            </Card>
        </div>
    )
}
