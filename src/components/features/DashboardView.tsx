"use client"

import { Card } from '@/components/ui/card'
import { ProgressBar } from '@/components/ui/progress-bar'
import { Button } from '@/components/ui/button'

const TRACK_LESSONS = [
    { id: 1, title: "What AI Is (and Is Not)", duration: "5 min" },
    { id: 2, title: "Where AI Appears in University Administration", duration: "5 min" },
    { id: 3, title: "Data, Privacy, and GDPR Basics", duration: "7 min" },
    { id: 4, title: "EU AI Act Overview for Admin Work", duration: "6 min" },
    { id: 5, title: "High Risk vs Low Risk AI Systems", duration: "5 min" },
    { id: 6, title: "Human Oversight and Responsibility", duration: "4 min" }
]

import { useProgress } from '@/lib/ProgressContext'

export function DashboardView() {
    const { overallProgress, isLessonComplete, resetProgress } = useProgress()

    // Find the first incomplete lesson to set as "Current"
    const firstIncomplete = TRACK_LESSONS.find(l => !isLessonComplete(l.id))
    const currentLessonId = firstIncomplete ? firstIncomplete.id : 7 // 7 means all done

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <section>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                    Welcome back, User
                </h1>
                <p style={{ color: 'hsl(var(--foreground) / 0.7)' }}>
                    Track: AI Basics and EU AI Act for Administrative Staff
                </p>
            </section>

            <Card>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', fontSize: '0.875rem' }}>
                    <span style={{ fontWeight: 600 }}>Your Progress</span>
                    <span>{overallProgress}% Complete</span>
                </div>
                <ProgressBar progress={overallProgress} />
            </Card>

            <section>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
                    Your Learning Path
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {TRACK_LESSONS.map((lesson) => (
                        <Card key={lesson.id} hoverable style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '1.25rem',
                            borderLeft: lesson.id === currentLessonId ? '4px solid hsl(var(--accent))' : '1px solid hsl(var(--border))',
                            opacity: isLessonComplete(lesson.id) ? 0.7 : 1
                        }}>
                            <div>
                                <div style={{ fontSize: '0.85rem', color: 'hsl(var(--foreground) / 0.6)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>
                                    Lesson {lesson.id}
                                </div>
                                <div style={{ fontWeight: 600, fontSize: '1.05rem' }}>
                                    {lesson.title}
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                <span style={{ fontSize: '0.875rem', color: 'hsl(var(--foreground) / 0.5)' }}>
                                    {lesson.duration}
                                </span>
                                {/* Demo Mode: All Unlocked */}
                                {lesson.id <= 6 ? (
                                    isLessonComplete(lesson.id) ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ color: 'hsl(var(--success, #22c55e))', fontWeight: 600, fontSize: '0.9rem' }}>✓ Done</span>
                                            <a href={`/lesson/${lesson.id}`} style={{ fontSize: '0.8rem', textDecoration: 'underline' }}>
                                                Review
                                            </a>
                                        </div>
                                    ) : (
                                        <a href={`/lesson/${lesson.id}`}>
                                            <Button variant={lesson.id === currentLessonId ? 'primary' : 'secondary'}>
                                                {lesson.id === currentLessonId ? 'Continue' : 'Start'}
                                            </Button>
                                        </a>
                                    )
                                ) : (
                                    <span style={{ opacity: 0.3, fontSize: '0.9rem' }}>Locked</span>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            </section>

            <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid hsl(var(--border))', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <p style={{ fontSize: '0.8rem', color: 'hsl(var(--foreground) / 0.5)' }}>Demo Controls</p>
                <Button
                    variant="secondary"
                    onClick={() => {
                        if (window.confirm('Are you sure you want to reset all progress?')) {
                            resetProgress()
                        }
                    }}
                    style={{ fontSize: '0.85rem' }}
                >
                    Reset My Progress
                </Button>
            </div>
        </div >
    )
}
