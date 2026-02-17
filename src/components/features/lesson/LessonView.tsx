"use client"

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ProgressBar } from '@/components/ui/progress-bar'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Zap } from 'lucide-react'

import { LESSONS } from '@/data/lessons'
import { useProgress } from '@/lib/ProgressContext'

interface QuizStepProps {
    data: {
        question?: string
        options?: string[]
        correctIndex?: number
        type?: string
        title?: string
        explanation?: string
    }
    onComplete: () => void
}

interface ScenarioInfo {
    id: string
    title: string
    riskLevel: string
    xpReward: number
    completed: boolean
}

export function LessonView({ lessonId }: { lessonId: string }) {
    const router = useRouter()
    const { markLessonComplete } = useProgress()
    const [currentStep, setCurrentStep] = useState(0)
    const [lessonDone, setLessonDone] = useState(false)
    const [scenario, setScenario] = useState<ScenarioInfo | null>(null)

    const lesson = LESSONS[lessonId]

    // Fetch related scenario
    useEffect(() => {
        async function loadScenario() {
            try {
                const res = await fetch(`/api/scenarios?lessonId=${lessonId}`)
                if (res.ok) {
                    const data = await res.json()
                    if (data.scenarios?.length > 0) {
                        setScenario(data.scenarios[0])
                    }
                }
            } catch (e) {
                // Scenario fetch is non-critical
            }
        }
        loadScenario()
    }, [lessonId])

    if (!lesson) {
        return <div className="p-8 text-center">Lesson not found</div>
    }

    const totalSteps = lesson.sections.length
    const progress = lessonDone ? 100 : ((currentStep + 1) / totalSteps) * 100

    const handleNext = () => {
        if (currentStep < totalSteps - 1) {
            setCurrentStep(currentStep + 1)
        } else {
            markLessonComplete(lessonId)
            setLessonDone(true)
        }
    }

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1)
        }
    }

    const section = lesson.sections[currentStep]

    // Show completion screen with scenario link
    if (lessonDone) {
        return (
            <div style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <header>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.875rem', color: 'hsl(var(--foreground) / 0.6)' }}>
                            {lesson.title}
                        </span>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                            Complete
                        </span>
                    </div>
                    <ProgressBar progress={100} />
                </header>

                <Card>
                    <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                            Lesson Complete!
                        </h2>
                        <p style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '2rem' }}>
                            Great work finishing &ldquo;{lesson.title}&rdquo;
                        </p>

                        {scenario && !scenario.completed && (
                            <div style={{
                                background: 'hsl(var(--accent) / 0.05)',
                                border: '1px solid hsl(var(--accent) / 0.15)',
                                borderRadius: 'var(--radius)',
                                padding: '1.25rem',
                                marginBottom: '1.5rem',
                                textAlign: 'left',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.95rem', color: 'hsl(var(--accent))', marginBottom: '0.5rem' }}>
                                    <AlertTriangle size={16} />
                                    Try the Interactive Scenario
                                </div>
                                <p style={{ fontSize: '0.85rem', color: 'hsl(var(--foreground))', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                                    Put your knowledge to the test with &ldquo;{scenario.title}&rdquo; — a real-world decision-making challenge.
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <Button onClick={() => router.push(`/scenario/${scenario.id}`)}>
                                        Start Scenario
                                    </Button>
                                    <span style={{ fontSize: '0.78rem', color: '#10B981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <Zap size={12} /> +{scenario.xpReward} XP
                                    </span>
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
                            <Button variant="secondary" onClick={() => router.push('/dashboard')}>
                                Back to Dashboard
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        )
    }

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <header>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', color: 'hsl(var(--foreground) / 0.6)' }}>
                        {lesson.title}
                    </span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                        {currentStep + 1} / {totalSteps}
                    </span>
                </div>
                <ProgressBar progress={progress} />
            </header>

            <Card key={currentStep}>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                    <span style={{
                        textTransform: 'uppercase',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        letterSpacing: '0.05em',
                        color: 'hsl(var(--accent))',
                        background: 'hsl(var(--accent) / 0.1)',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '0.25rem'
                    }}>
                        {section.type}
                    </span>
                </div>

                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                    {section.title}
                </h2>

                <div style={{ fontSize: '1.125rem', lineHeight: '1.7', color: 'hsl(var(--foreground))' }}>
                    {section.type === 'skill' ? (
                        <QuizStep data={section} onComplete={handleNext} />
                    ) : (
                        <p>{section.content}</p>
                    )}
                </div>

                {section.type !== 'skill' && (
                    <>
                        {section.sourceUrl && (
                            <div style={{ marginTop: '1.5rem' }}>
                                <a
                                    href={section.sourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.35rem',
                                        fontSize: '0.85rem',
                                        color: 'hsl(var(--accent))',
                                        fontWeight: 600,
                                        textDecoration: 'none',
                                        padding: '0.4rem 0.75rem',
                                        borderRadius: '0.375rem',
                                        border: '1px solid hsl(var(--accent) / 0.2)',
                                        background: 'hsl(var(--accent) / 0.05)',
                                        transition: 'background 0.15s',
                                    }}
                                >
                                    📖 Read More: {section.sourceLabel || 'Source'}
                                </a>
                            </div>
                        )}
                        <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            {currentStep > 0 ? (
                                <Button variant="secondary" onClick={handlePrev} style={{ fontSize: '1rem', padding: '0.75rem 1.5rem' }}>
                                    ← Previous
                                </Button>
                            ) : <div />}
                            <Button onClick={handleNext} style={{ fontSize: '1rem', padding: '0.75rem 2rem' }}>
                                {currentStep === totalSteps - 1 ? 'Finish Lesson' : 'Continue'}
                            </Button>
                        </div>
                    </>
                )}
            </Card>
        </div>
    )
}

function QuizStep({ data, onComplete }: QuizStepProps) {
    const [selected, setSelected] = useState<number | null>(null)
    const [showResult, setShowResult] = useState(false)

    const isCorrect = selected === data.correctIndex

    const handleCheck = () => {
        setShowResult(true)
    }

    return (
        <div>
            <p style={{ marginBottom: '1.5rem', fontWeight: 500 }}>{data.question}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                {(data.options || []).map((opt: string, idx: number) => (
                    <button
                        key={idx}
                        onClick={() => !showResult && setSelected(idx)}
                        type="button"
                        style={{
                            padding: '1rem',
                            borderRadius: '0.5rem',
                            border: '1px solid',
                            textAlign: 'left',
                            background: selected === idx ? 'hsl(var(--accent) / 0.05)' : 'transparent',
                            borderColor: paramsBorderColor(idx, selected, showResult, data.correctIndex || 0),
                            cursor: showResult ? 'default' : 'pointer',
                            fontSize: '1rem',
                            fontFamily: 'inherit',
                            color: 'inherit',
                            transition: 'all 0.2s',
                            width: '100%'
                        }}
                    >
                        {opt}
                        {showResult && idx === data.correctIndex && " ✅"}
                        {showResult && selected === idx && idx !== data.correctIndex && " ❌"}
                    </button>
                ))}
            </div>

            {showResult ? (
                <div style={{ animation: 'fadeIn 0.3s ease' }}>
                    {isCorrect ? (
                        <div style={{ color: '#15803d', fontWeight: 600, background: '#dcfce7', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #bbf7d0' }}>
                            {data.explanation || 'Correct! Well done.'}
                        </div>
                    ) : (
                        <div style={{ color: '#b91c1c', fontWeight: 600, background: '#fee2e2', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #fecaca' }}>
                            {data.explanation || 'Not quite. Try again!'}
                        </div>
                    )}

                    {isCorrect && (
                        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                            <Button onClick={onComplete}>Continue</Button>
                        </div>
                    )}
                    {!isCorrect && <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}><Button variant="secondary" onClick={() => { setShowResult(false); setSelected(null); }}>Try Again</Button></div>}
                </div>
            ) : (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button onClick={handleCheck} disabled={selected === null}>Check Answer</Button>
                </div>
            )}
        </div>
    )
}

function paramsBorderColor(idx: number, selected: number | null, showResult: boolean, correctIndex: number) {
    if (showResult) {
        if (idx === correctIndex) return '#22c55e' // Green
        if (selected === idx && idx !== correctIndex) return '#ef4444' // Red
    }
    if (selected === idx) return 'hsl(var(--accent))'
    return 'hsl(var(--border))'
}
