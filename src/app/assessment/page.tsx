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
            const unansweredQuestion = questions.find(q => !answers[q.id]);

            if (unansweredQuestion) {
                setError('Please answer all questions before submitting.');

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
            <div className={styles.invalidPage}>
                <p>Invalid Assessment Type</p>
            </div>
        );
    }

    const title = isPreTest ? 'Welcome — Initial Assessment' : 'Knowledge Check — Post Assessment';
    const description = isPreTest
        ? 'Before we begin, please complete this brief assessment. This helps us tailor your learning experience. The questions are randomized — just answer to the best of your ability.'
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
                                <div
                                    key={`${q.id}-${isBlinking ? blinkingQuestion?.key : 'static'}`}
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
                                        {q.category === 'LITERACY' && q.options ? (
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
                                        ) : (
                                            <div className={styles.likertContainer}>
                                                <div className={styles.likertLabels}>
                                                    <span className={styles.likertLabel}>1 (Strongly disagree)</span>
                                                    <span className={styles.likertLabel}>5 (Strongly agree)</span>
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
                            )
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
