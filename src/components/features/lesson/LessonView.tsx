"use client"

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ProgressBar } from '@/components/ui/progress-bar'
import { useRouter } from 'next/navigation'

interface Section {
    type: 'knowledge' | 'context' | 'skill' | 'disposition'
    title: string
    content?: string
    question?: string
    options?: string[]
    correctIndex?: number
}

// Mock Data for Lesson 2 (Hardcoded for MVP demo)
const LESSON_DATA = {
    id: 2,
    title: "Where AI Appears in University Administration",
    sections: [
        {
            type: 'knowledge',
            title: 'Knowledge',
            content: "AI isn't just robots. In university admin, it appears in: Email filtering (spam), Predictive text (Gmail), Translation tools (DeepL), Recruitment screening tools."
        },
        {
            type: 'context',
            title: 'Context: The Admissions Inbox',
            content: "Imagine you are an admissions officer. You receive 5,000 emails a week during peak season. You use a tool that automatically tags emails as 'Urgent', 'Standard', or 'SPAM'. This tool is AI."
        },
        {
            type: 'skill',
            title: 'Skill: Identify the AI',
            question: "Which of these is likely using AI?",
            options: [
                "A spreadsheet calculating the sum of student fees",
                "A system flagging 'high potential' applicants based on essay keywords",
                "An email merge sending bulk acceptances"
            ],
            correctIndex: 1
        },
        {
            type: 'disposition',
            title: 'Reflection',
            content: "If the AI system flags an applicant as 'Low Potential', should you trust it blindly? What if the AI is biased against certain keywords? Your responsibility is oversight."
        }
    ]
} as const

export function LessonView({ lessonId }: { lessonId: string }) {
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(0)
    const totalSteps = LESSON_DATA.sections.length
    const progress = ((currentStep + 1) / totalSteps) * 100

    const handleNext = () => {
        if (currentStep < totalSteps - 1) {
            setCurrentStep(currentStep + 1)
        } else {
            router.push('/dashboard') // Finish
        }
    }

    const section = LESSON_DATA.sections[currentStep]

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <header>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', color: 'hsl(var(--foreground) / 0.6)' }}>
                        {LESSON_DATA.title}
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
                    <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                        <Button onClick={handleNext} style={{ fontSize: '1rem', padding: '0.75rem 2rem' }}>
                            {currentStep === totalSteps - 1 ? 'Finish Lesson' : 'Continue'}
                        </Button>
                    </div>
                )}
            </Card>
        </div>
    )
}

function QuizStep({ data, onComplete }: any) {
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
                {data.options.map((opt: string, idx: number) => (
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
                            borderColor: paramsBorderColor(idx, selected, showResult, data.correctIndex),
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
                            Correct! That works based on patterns, not just data entry.
                        </div>
                    ) : (
                        <div style={{ color: '#b91c1c', fontWeight: 600, background: '#fee2e2', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #fecaca' }}>
                            Not quite. Try thinking about which one involves prediction based on complex patterns.
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
