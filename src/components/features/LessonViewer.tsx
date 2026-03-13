"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { AlertTriangle, ArrowLeft, Zap } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type BlockType = "text" | "quiz" | "image";

export interface LessonStep {
    type: BlockType;
    sectionType?: string; // e.g. 'knowledge', 'context', 'skill', 'disposition'
    content?: string;
    question?: string;
    options?: string[];
    answer?: string;
    explanation?: string;
    sourceUrl?: string;
    sourceLabel?: string;
    url?: string;
    alt?: string;
}

interface ScenarioInfo {
    id: string;
    title: string;
    riskLevel: string;
    xpReward: number;
    completed: boolean;
}

interface LessonViewerProps {
    lessonId: string;
    lessonTitle?: string;
    initialSteps: LessonStep[];
    onComplete: () => void;
    phaseSlug?: string;
    nextLessonId?: string;
}

export default function LessonViewer({ lessonId, lessonTitle, initialSteps, onComplete, phaseSlug, nextLessonId }: LessonViewerProps) {
    const router = useRouter();
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [quizSelected, setQuizSelected] = useState<string | null>(null);
    const [quizSubmitted, setQuizSubmitted] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [scenario, setScenario] = useState<ScenarioInfo | null>(null);

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
        if (lessonId) {
            loadScenario()
        }
    }, [lessonId])

    if (!initialSteps || initialSteps.length === 0) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>This lesson has no content.</div>;
    }

    const currentStep = initialSteps[currentStepIndex];
    const isLastStep = currentStepIndex === initialSteps.length - 1;
    const isQuizCorrect = quizSubmitted && quizSelected === currentStep.answer;
    const isQuizWrong = quizSubmitted && quizSelected !== currentStep.answer;
    const progress = isCompleted ? 100 : ((currentStepIndex + 1) / initialSteps.length) * 100;

    const handleNext = () => {
        if (currentStep.type === "quiz") {
            if (!quizSubmitted) {
                setQuizSubmitted(true);
            } else if (isQuizCorrect) {
                advance();
            }
        } else {
            advance();
        }
    };

    const handlePrev = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex((prev) => prev - 1);
            setQuizSelected(null);
            setQuizSubmitted(false);
        }
    };

    const handleRetry = () => {
        setQuizSelected(null);
        setQuizSubmitted(false);
    };

    const advance = () => {
        if (isLastStep) {
            if (!isCompleted) {
                setIsCompleted(true);
                onComplete();
            }
        } else {
            setCurrentStepIndex((prev) => prev + 1);
            setQuizSelected(null);
            setQuizSubmitted(false);
        }
    };

    // Completion screen — matches LessonView style
    if (isCompleted) {
        return (
            <div style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <header>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.875rem', color: 'hsl(var(--foreground) / 0.6)' }}>
                            {lessonTitle || 'Lesson'}
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
                            Great work finishing &ldquo;{lessonTitle || 'this lesson'}&rdquo;
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

                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                            {nextLessonId ? (
                                <Button 
                                    onClick={() => router.push(`/lesson/${nextLessonId}`)}
                                    style={{ background: '#10B981', color: 'white' }}
                                >
                                    Next Lesson →
                                </Button>
                            ) : phaseSlug && (
                                <Button 
                                    onClick={() => router.push(`/courses/${phaseSlug}`)}
                                    style={{ background: 'hsl(var(--accent))', color: 'white' }}
                                >
                                    Back to Course
                                </Button>
                            )}
                            
                            {!nextLessonId && phaseSlug && null} {/* Already handled in ternary if/else logic */}
                            
                            <Button variant="secondary" onClick={() => router.push('/dashboard')}>
                                Back to Dashboard
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    // Step type label
    const typeLabel = currentStep.sectionType || (currentStep.type === "quiz" ? "Quiz" : currentStep.type === "image" ? "Visual" : "Knowledge");

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Back button */}
            <button
                onClick={() => router.back()}
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: 'hsl(var(--muted-foreground))',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    alignSelf: 'flex-start',
                    transition: 'color 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'hsl(var(--accent))')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'hsl(var(--muted-foreground))')}
            >
                <ArrowLeft size={16} /> Back to Course
            </button>

            {/* Header with progress */}
            <header>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', color: 'hsl(var(--foreground) / 0.6)' }}>
                        {lessonTitle || 'Lesson'}
                    </span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                        {currentStepIndex + 1} / {initialSteps.length}
                    </span>
                </div>
                <ProgressBar progress={progress} />
            </header>

            <Card key={currentStepIndex}>
                {/* Section type badge */}
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
                        {typeLabel}
                    </span>
                    <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        color: 'hsl(var(--muted-foreground))',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '0.25rem',
                        background: 'hsl(var(--muted) / 0.5)'
                    }}>
                        Step {currentStepIndex + 1}
                    </span>
                </div>

                {/* Content */}
                <div style={{ fontSize: '1.125rem', lineHeight: '1.7', color: 'hsl(var(--foreground))' }}>
                    {/* Text block */}
                    {currentStep.type === "text" && (
                        <>
                            <div className="markdown-content" style={{ fontSize: '1rem', lineHeight: '1.7', color: 'hsl(var(--foreground))' }}>
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        p: ({ node, ...props }) => <p style={{ marginBottom: '1rem' }} {...props} />,
                                        ul: ({ node, ...props }) => <ul style={{ marginBottom: '1rem', paddingLeft: '1.5rem', listStyleType: 'disc' }} {...props} />,
                                        ol: ({ node, ...props }) => <ol style={{ marginBottom: '1rem', paddingLeft: '1.5rem', listStyleType: 'decimal' }} {...props} />,
                                        li: ({ node, ...props }) => <li style={{ marginBottom: '0.25rem' }} {...props} />,
                                        h1: ({ node, ...props }) => <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', marginTop: '1.5rem' }} {...props} />,
                                        h2: ({ node, ...props }) => <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem', marginTop: '1.25rem' }} {...props} />,
                                        h3: ({ node, ...props }) => <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem', marginTop: '1rem' }} {...props} />,
                                        strong: ({ node, ...props }) => <strong style={{ fontWeight: 600, color: 'hsl(var(--foreground))' }} {...props} />,
                                        a: ({ node, ...props }) => <a style={{ color: 'hsl(var(--primary))', textDecoration: 'underline' }} {...props} />,
                                    }}
                                >
                                    {currentStep.content || ''}
                                </ReactMarkdown>
                            </div>
                            {currentStep.sourceUrl && (
                                <div style={{ marginTop: '1.5rem' }}>
                                    <a
                                        href={currentStep.sourceUrl}
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
                                        }}
                                    >
                                        📖 Read More: {currentStep.sourceLabel || 'Source'}
                                    </a>
                                </div>
                            )}
                        </>
                    )}

                    {/* Image block */}
                    {currentStep.type === "image" && (
                        <div style={{ textAlign: 'center' }}>
                            <img
                                src={currentStep.url}
                                alt={currentStep.alt || "Lesson image"}
                                style={{ maxWidth: '100%', height: 'auto', borderRadius: 'var(--radius)', marginBottom: '0.5rem' }}
                            />
                            {currentStep.alt && (
                                <p style={{ fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))' }}>{currentStep.alt}</p>
                            )}
                        </div>
                    )}

                    {/* Quiz block */}
                    {currentStep.type === "quiz" && (
                        <div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>
                                {currentStep.question}
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {currentStep.options?.map((opt, idx) => {
                                    const isSelected = quizSelected === opt;
                                    let borderColor = 'hsl(var(--border))';
                                    let bg = 'transparent';
                                    let textColor = 'hsl(var(--foreground))';
                                    let opacity = 1;

                                    if (quizSubmitted) {
                                        if (opt === currentStep.answer) {
                                            borderColor = '#22c55e';
                                            bg = '#f0fdf4';
                                            textColor = '#166534';
                                        } else if (isSelected && opt !== currentStep.answer) {
                                            borderColor = '#ef4444';
                                            bg = '#fef2f2';
                                            textColor = '#991b1b';
                                        } else {
                                            opacity = 0.5;
                                        }
                                    } else if (isSelected) {
                                        borderColor = 'hsl(var(--accent))';
                                        bg = 'hsl(var(--accent) / 0.05)';
                                    }

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => !quizSubmitted && setQuizSelected(opt)}
                                            disabled={quizSubmitted}
                                            style={{
                                                width: '100%',
                                                padding: '1rem',
                                                textAlign: 'left',
                                                border: `1px solid ${borderColor}`,
                                                borderRadius: 'var(--radius)',
                                                background: bg,
                                                color: textColor,
                                                opacity,
                                                cursor: quizSubmitted ? 'default' : 'pointer',
                                                fontSize: '1rem',
                                                transition: 'all 0.15s',
                                            }}
                                        >
                                            {opt}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Feedback */}
                            {quizSubmitted && (
                                <div style={{
                                    marginTop: '1rem',
                                    padding: '0.75rem 1rem',
                                    background: isQuizCorrect ? '#f0fdf4' : '#fef2f2',
                                    border: `1px solid ${isQuizCorrect ? '#bbf7d0' : '#fecaca'}`,
                                    borderRadius: '0.5rem',
                                    fontSize: '0.9rem',
                                    color: isQuizCorrect ? '#166534' : '#991b1b',
                                    lineHeight: 1.5,
                                }}>
                                    {isQuizCorrect
                                        ? (currentStep.explanation ? `💡 ${currentStep.explanation}` : '✅ Correct! Well done.')
                                        : (currentStep.explanation ? `💡 ${currentStep.explanation}` : '❌ That\'s not quite right. Try again!')
                                    }
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Navigation buttons */}
                {currentStep.type !== "quiz" && (
                    <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {currentStepIndex > 0 ? (
                            <Button variant="secondary" onClick={handlePrev} style={{ fontSize: '1rem', padding: '0.75rem 1.5rem' }}>
                                ← Previous
                            </Button>
                        ) : <div />}
                        <Button onClick={handleNext} style={{ fontSize: '1rem', padding: '0.75rem 2rem' }}>
                            {isLastStep ? 'Finish Lesson' : 'Continue'}
                        </Button>
                    </div>
                )}

                {currentStep.type === "quiz" && (
                    <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {currentStepIndex > 0 ? (
                            <Button variant="secondary" onClick={handlePrev} style={{ fontSize: '1rem', padding: '0.75rem 1.5rem' }}>
                                ← Previous
                            </Button>
                        ) : <div />}
                        {isQuizWrong ? (
                            <Button onClick={handleRetry} style={{ fontSize: '1rem', padding: '0.75rem 2rem' }}>
                                🔄 Try Again
                            </Button>
                        ) : (
                            <Button
                                onClick={handleNext}
                                disabled={!quizSelected && !quizSubmitted}
                                style={{ fontSize: '1rem', padding: '0.75rem 2rem' }}
                            >
                                {!quizSubmitted ? 'Check Answer' : (isLastStep ? 'Finish Lesson' : 'Continue')}
                            </Button>
                        )}
                    </div>
                )}
            </Card>
        </div>
    );
}
