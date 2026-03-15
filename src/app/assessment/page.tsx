'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { assessmentQuestions, AssessmentQuestion } from '@/lib/assessment-data';
import { submitAssessmentAction } from '@/app/actions/assessment';
import { AssessmentType } from '@prisma/client';
import styles from './assessment.module.css';

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

    useEffect(() => {
        const shuffle = <T,>(array: T[]): T[] => {
            const arr = [...array];
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
        };

        // Filter: Pre-test only gets LITERACY questions
        const filteredQuestions = isPreTest
            ? assessmentQuestions.filter(q => q.category === 'LITERACY')
            : assessmentQuestions;

        setQuestions(shuffle(filteredQuestions));
    }, [isPreTest]);

    const handleAnswerChange = (questionId: string, value: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const handleOrderingChange = (questionId: string, itemValue: string) => {
        setAnswers(prev => {
            const currentOrder = prev[questionId] ? prev[questionId].split(',') : [];
            let newOrder;
            if (currentOrder.includes(itemValue)) {
                newOrder = currentOrder.filter(i => i !== itemValue);
            } else {
                newOrder = [...currentOrder, itemValue];
            }
            return { ...prev, [questionId]: newOrder.join(',') };
        });
    };

    const calculateProgress = () => {
        if (questions.length === 0) return 0;
        return Math.round((Object.keys(answers).length / questions.length) * 100);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate all questions are answered
        const unansweredQuestion = questions.find(q => {
            const answer = answers[q.id];
            if (!answer) return true;
            if (q.type === 'ORDERING' && answer.split(',').length < (q.items?.length || 0)) return true;
            return false;
        });

        if (unansweredQuestion) {
            setError(unansweredQuestion.type === 'ORDERING' 
                ? 'Please complete the ordering for all items.' 
                : 'Please answer all questions before submitting.');

            const element = document.getElementById(`question-${unansweredQuestion.id}`);
            if (element) {
                setTimeout(() => {
                    const yPosition = element.getBoundingClientRect().top + window.scrollY - 100;
                    window.scrollTo({ top: yPosition, behavior: 'smooth' });
                    setBlinkingQuestion(prev => ({ id: unansweredQuestion.id, key: (prev?.key || 0) + 1 }));
                }, 50);

                setTimeout(() => {
                    setBlinkingQuestion(null);
                }, 1550);
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
            <div className={styles.invalidPage}>
                <p>Invalid Assessment Type</p>
            </div>
        );
    }

    const title = isPreTest ? 'AI Literacy Assessment' : 'Knowledge Check — Post Assessment';
    const description = isPreTest
        ? 'Welcome! This assessment helps us understand your starting point. Please answer the knowledge questions honestly.'
        : 'Congratulations on your progress! Please complete this follow-up assessment to help us measure the impact of the platform.';

    return (
        <div className={styles.assessmentPage}>
            {/* Sticky Progress Bar */}
            <div className={styles.progressBar}>
                <div className={styles.progressInner}>
                    <div className={styles.progressLabels}>
                        <span className={styles.progressLabel}>Progress</span>
                        <span className={styles.progressLabel}>{calculateProgress()}%</span>
                    </div>
                    <div className={styles.progressTrack}>
                        <div
                            className={styles.progressFill}
                            style={{ width: `${calculateProgress()}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className={styles.content}>
                {/* Header Card */}
                <div className={styles.assessmentHeader}>
                    <h1 className={styles.assessmentTitle}>{title}</h1>
                    <p className={styles.assessmentDesc}>{description}</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className={styles.questionList}>
                        {questions.map((q, index) => {
                            const isUnanswered = error && !answers[q.id];
                            const isBlinking = blinkingQuestion?.id === q.id;

                            return (
                                <div key={q.id}>
                                    <div
                                        id={`question-${q.id}`}
                                        className={`${styles.questionCard} ${isUnanswered ? styles.questionCardUnanswered : ''} ${isBlinking ? 'animate-double-blink' : ''}`}
                                    >
                                        <div className={styles.questionHeader}>
                                            <h3 className={styles.questionTitle}>
                                                <span className={styles.questionNumber}>{index + 1}.</span>
                                                {q.text}
                                            </h3>
                                        </div>
                                        <div className={styles.questionBody}>
                                            {q.type === 'MC' && q.options && (
                                                <div className={styles.optionsList}>
                                                    {q.options.map(opt => (
                                                        <div
                                                            key={opt.value}
                                                            className={`${styles.optionItem} ${answers[q.id] === opt.value ? styles.optionItemSelected : ''}`}
                                                            onClick={() => handleAnswerChange(q.id, opt.value)}
                                                        >
                                                            <input
                                                                type="radio"
                                                                id={`${q.id}-${opt.value}`}
                                                                name={q.id}
                                                                value={opt.value}
                                                                checked={answers[q.id] === opt.value}
                                                                onChange={() => handleAnswerChange(q.id, opt.value)}
                                                                className={styles.optionRadio}
                                                            />
                                                            <label htmlFor={`${q.id}-${opt.value}`} className={styles.optionLabel}>
                                                                {opt.label}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {q.type === 'ORDERING' && q.items && (
                                                <div className={styles.orderingContainer}>
                                                    <p className={styles.orderingHint}>Click labels in order (1 to {q.items.length})</p>
                                                    <div className={styles.orderingGrid}>
                                                        {q.items.map((item, i) => {
                                                            const orderIndex = answers[q.id]?.split(',').indexOf(item);
                                                            return (
                                                                <div
                                                                    key={i}
                                                                    className={`${styles.orderItem} ${orderIndex !== -1 ? styles.orderItemSelected : ''}`}
                                                                    onClick={() => handleOrderingChange(q.id, item)}
                                                                >
                                                                    <div className={styles.orderBadge}>
                                                                        {orderIndex !== -1 ? orderIndex + 1 : ''}
                                                                    </div>
                                                                    <div className={styles.orderLabel}>{item}</div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {q.type === 'LIKERT' && (
                                                <div className={styles.likertContainer}>
                                                    <div className={styles.likertLabels}>
                                                        <span className={styles.likertLabel}>Strongly disagree</span>
                                                        <span className={styles.likertLabel}>Strongly agree</span>
                                                    </div>
                                                    <div className={styles.likertScale}>
                                                        {[1, 2, 3, 4, 5].map(val => (
                                                            <div
                                                                key={val}
                                                                className={`${styles.likertItem} ${answers[q.id] === val.toString() ? styles.likertItemSelected : ''}`}
                                                                onClick={() => handleAnswerChange(q.id, val.toString())}
                                                            >
                                                                <input
                                                                    type="radio"
                                                                    id={`${q.id}-${val}`}
                                                                    name={q.id}
                                                                    value={val.toString()}
                                                                    checked={answers[q.id] === val.toString()}
                                                                    onChange={() => handleAnswerChange(q.id, val.toString())}
                                                                    className={styles.likertRadio}
                                                                />
                                                                <label htmlFor={`${q.id}-${val}`} className={styles.likertValue}>
                                                                    {val}
                                                                </label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {error && (
                        <div className={styles.errorBanner}>
                            {error}
                        </div>
                    )}

                    <div className={styles.submitSection}>
                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Submitting Responses...' : 'Submit Assessment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function AssessmentPage() {
    return (
        <Suspense fallback={<div className={styles.loadingPage}>Loading assessment...</div>}>
            <AssessmentForm />
        </Suspense>
    );
}
