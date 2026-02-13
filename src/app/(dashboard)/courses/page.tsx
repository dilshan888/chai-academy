import { Card } from '@/components/ui/card'
import { BookOpen } from 'lucide-react'

export default function CoursesPage() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem' }}>
            <Card style={{ padding: '3rem', textAlign: 'center', maxWidth: '480px' }}>
                <BookOpen size={48} style={{ color: 'hsl(var(--accent))', marginBottom: '1rem' }} />
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    My Courses
                </h1>
                <p style={{ color: 'hsl(var(--muted-foreground))', lineHeight: 1.5 }}>
                    Browse and enroll in courses to build your AI compliance knowledge.
                    This feature is coming soon.
                </p>
            </Card>
        </div>
    )
}
