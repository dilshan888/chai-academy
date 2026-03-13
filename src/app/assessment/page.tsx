'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { assessmentQuestions, AssessmentQuestion } from '@/lib/assessment-data';
import { submitAssessmentAction } from '@/app/actions/assessment';
import { AssessmentType } from '@prisma/client';

function AssessmentForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const typeParam = searchParams.get('type') as 'pre' | 'post' | null;

    const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [blinkingQuestion, setBlinkingQuestion] = useState<{id: string, key: number} | null>(null);

    const isPreTest = typeParam === 'pre';
    const type: AssessmentType = isPreTest ? 'PRE_TEST' : 'POST_TEST';

    // Randomize questions on mount
    useEffect(() => {
        const shuffled = [...assessmentQuestions].sort(() => Math.random() - 0.5);
        setQuestions(shuffled);
    }, []);

    const handleAnswerChange = (questionId: string, value: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const calculateProgress = () => {
        if (questions.length === 0) return 0;
        return Math.round((Object.keys(answers).length / questions.length) * 100);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (Object.keys(answers).length < questions.length) {
            // Find the first unanswered question
            const unansweredQuestion = questions.find(q => !answers[q.id]);

            if (unansweredQuestion) {
                setError('Please answer all questions before submitting.');

                // Scroll to the first unanswered question
                const element = document.getElementById(`question-${unansweredQuestion.id}`);
                if (element) {
                    setTimeout(() => {
                        const yPosition = element.getBoundingClientRect().top + window.scrollY - 100;
                        window.scrollTo({
                            top: yPosition,
                            behavior: 'smooth'
                        });
                        setBlinkingQuestion(prev => ({ id: unansweredQuestion.id, key: (prev?.key || 0) + 1 }));
                    }, 50);

                    // Trigger blink state
                    setTimeout(() => {
                        setBlinkingQuestion(null);
                    }, 1550);
                }
            }
            return;
        }

        setIsSubmitting(true);
        setError(null);

        const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
            questionId,
            answer
        }));

        const result = await submitAssessmentAction(type, formattedAnswers);

        if (result.success) {
            router.push('/dashboard?assessment=completed');
        } else {
            setError(result.error || 'Something went wrong.');
            setIsSubmitting(false);
        }
    };

    if (!typeParam || (typeParam !== 'pre' && typeParam !== 'post')) {
        return (
            <div className="flex h-screen items-center justify-center">
                <p>Invalid Assessment Type</p>
            </div>
        );
    }

    const title = isPreTest ? 'Welcome - Initial Assessment' : 'Knowledge Check - Post Assessment';
    const description = isPreTest
        ? 'Before we begin, please complete this brief assessment. This helps us tailor your experience. The order is randomized. There are no right or wrong actions, just answer to the best of your ability.'
        : 'Congratulations on your progress! Please complete this follow-up assessment to help us measure the impact of the platform.';

    return (
        <div className="min-h-screen">
            <div className="fixed top-0 left-0 right-0 z-[100] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 border-b shadow-sm w-full">
                <div className="max-w-4xl mx-auto flex flex-col justify-center">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Progress</span>
                        <span className="text-sm font-medium">{calculateProgress()}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden">
                        <div
                            className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${calculateProgress()}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            <div className="container max-w-4xl py-12 mx-auto px-4 mt-20">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold tracking-tight mb-2">{title}</h1>
                    <p className="text-muted-foreground">{description}</p>
                </div>
            <form onSubmit={handleSubmit} className="space-y-8">
                {questions.map((q, index) => {
                    const isUnanswered = error && !answers[q.id];
                    const isBlinking = blinkingQuestion?.id === q.id;
                    return (
                        <div
                            key={`${q.id}-${isBlinking ? blinkingQuestion?.key : 'static'}`}
                            id={`question-${q.id}`}
                            className={`bg-card text-card-foreground border rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] overflow-hidden transition-all duration-300 ${isUnanswered ? 'border-destructive/50 bg-destructive/5' : ''} ${isBlinking ? 'animate-double-blink' : ''}`}
                        >
                            <div className={`p-6 space-y-1.5 border-b ${isUnanswered ? 'bg-destructive/10' : 'bg-primary/5'}`}>
                                <h3 className="text-xl leading-relaxed font-semibold">
                                    <span className="text-primary/70 mr-3 text-2xl">{index + 1}.</span>
                                    {q.text}
                                </h3>
                            </div>
                            <div className="p-8">
                                {q.category === 'LITERACY' && q.options ? (
                                    <div
                                        className="space-y-4"
                                    >
                                        {q.options.map(opt => (
                                            <div
                                                key={opt.value}
                                                className={`flex items-center space-x-4 p-4 rounded-lg border-2 transition-colors cursor-pointer hover:bg-muted/50 ${answers[q.id] === opt.value ? 'border-primary bg-primary/5' : 'border-transparent hover:border-muted-foreground/20'}`}
                                                onClick={() => handleAnswerChange(q.id, opt.value)}
                                            >
                                                <input
                                                    type="radio"
                                                    id={`${q.id}-${opt.value}`}
                                                    name={q.id}
                                                    value={opt.value}
                                                    checked={answers[q.id] === opt.value}
                                                    onChange={() => handleAnswerChange(q.id, opt.value)}
                                                    className="w-6 h-6 text-primary focus:ring-primary border-muted cursor-pointer shrink-0"
                                                />
                                                <label htmlFor={`${q.id}-${opt.value}`} className="text-lg font-medium cursor-pointer leading-snug select-none flex-1">
                                                    {opt.label}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-8">
                                        <div className="flex justify-between text-sm text-muted-foreground px-2 pb-3 border-b-2">
                                            <span className="font-medium">1 (Strongly disagree)</span>
                                            <span className="font-medium">5 (Strongly agree)</span>
                                        </div>
                                        <div className="flex justify-between w-full pt-4 px-2">
                                            {[1, 2, 3, 4, 5].map(val => (
                                                <div
                                                    key={val}
                                                    className={`flex flex-col items-center justify-center space-y-3 p-4 rounded-xl border-2 transition-all cursor-pointer w-20 h-24 sm:w-24 sm:h-28 hover:bg-muted/50 ${answers[q.id] === val.toString() ? 'border-primary bg-primary/5 shadow-sm transform scale-105' : 'border-muted'}`}
                                                    onClick={() => handleAnswerChange(q.id, val.toString())}
                                                >
                                                    <input
                                                        type="radio"
                                                        id={`${q.id}-${val}`}
                                                        name={q.id}
                                                        value={val.toString()}
                                                        checked={answers[q.id] === val.toString()}
                                                        onChange={() => handleAnswerChange(q.id, val.toString())}
                                                        className="w-6 h-6 sm:w-8 sm:h-8 cursor-pointer text-primary focus:ring-primary border-muted"
                                                    />
                                                    <label htmlFor={`${q.id}-${val}`} className="cursor-pointer text-xl sm:text-2xl font-bold text-foreground/80">
                                                        {val}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}

                {error && (
                    <div className="bg-destructive/15 text-destructive border border-destructive/50 px-6 py-4 rounded-lg flex items-center justify-center text-lg font-medium shadow-sm animate-in fade-in slide-in-from-bottom-4">
                        {error}
                    </div>
                )}

                <div className="flex justify-end pt-8 pb-16 border-t mt-12">
                    <Button type="submit" className="px-10 py-6 text-xl rounded-xl shadow-md transition-all hover:shadow-lg hover:-translate-y-1" disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting Responses...' : 'Submit Assessment'}
                    </Button>
                </div>
            </form>
            </div>
        </div>
    );
}

export default function AssessmentPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center p-8 text-muted-foreground">Loading assessment...</div>}>
            <AssessmentForm />
        </Suspense>
    );
}
