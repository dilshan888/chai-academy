"use client";

import { useState } from "react";
import { Check, ChevronRight, ChevronLeft, RotateCcw } from "lucide-react";

type BlockType = "text" | "quiz" | "image";

export interface LessonStep {
    type: BlockType;
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

interface LessonViewerProps {
    lessonId: string;
    initialSteps: LessonStep[];
    onComplete: () => void;
}

export default function LessonViewer({ lessonId, initialSteps, onComplete }: LessonViewerProps) {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [quizSelected, setQuizSelected] = useState<string | null>(null);
    const [quizSubmitted, setQuizSubmitted] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);

    // Fallback for empty lesson
    if (!initialSteps || initialSteps.length === 0) {
        return <div className="p-6 text-center">This lesson has no content.</div>;
    }

    const currentStep = initialSteps[currentStepIndex];
    const isLastStep = currentStepIndex === initialSteps.length - 1;
    const isQuizCorrect = quizSubmitted && quizSelected === currentStep.answer;
    const isQuizWrong = quizSubmitted && quizSelected !== currentStep.answer;

    const handleNext = () => {
        if (currentStep.type === "quiz") {
            if (!quizSubmitted) {
                // First click: check the answer
                setQuizSubmitted(true);
            } else if (isQuizCorrect) {
                // Correct answer: advance
                advance();
            }
            // If wrong: do nothing — user must click "Try Again" first
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
            // Reset quiz state
            setQuizSelected(null);
            setQuizSubmitted(false);
        }
    };

    if (isCompleted) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 text-center p-6">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    <Check size={32} />
                </div>
                <h2 className="text-2xl font-bold">Lesson Completed!</h2>
                <p className="text-gray-600">Great job finished this lesson.</p>
                <button
                    onClick={() => window.location.href = '/dashboard'} // Simple exit
                    className="mt-4 px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    // Button label logic
    let nextButtonLabel = isLastStep ? "Finish" : "Next";
    let nextDisabled = false;

    if (currentStep.type === "quiz") {
        if (!quizSubmitted) {
            nextButtonLabel = "Check Answer";
            nextDisabled = !quizSelected;
        } else if (isQuizWrong) {
            nextButtonLabel = "Try Again";
            nextDisabled = false;
        }
    }

    return (
        <div className="max-w-md mx-auto bg-white min-h-[600px] shadow-lg rounded-xl overflow-hidden flex flex-col">
            {/* Progress Bar */}
            <div className="h-1 bg-gray-100 w-full">
                <div
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${((currentStepIndex + 1) / initialSteps.length) * 100}%` }}
                />
            </div>

            <div className="flex-1 p-6 flex flex-col items-center justify-center">
                {/* Content Rendering */}
                {currentStep.type === "text" && (
                    <div className="w-full">
                        <div className="prose text-lg text-center font-medium">
                            {currentStep.content}
                        </div>
                        {currentStep.sourceUrl && (
                            <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
                                <a
                                    href={currentStep.sourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.35rem',
                                        fontSize: '0.8rem',
                                        color: '#2563eb',
                                        fontWeight: 600,
                                        textDecoration: 'none',
                                        padding: '0.35rem 0.65rem',
                                        borderRadius: '0.375rem',
                                        border: '1px solid #bfdbfe',
                                        background: '#eff6ff',
                                    }}
                                >
                                    📖 Read More{currentStep.sourceLabel ? `: ${currentStep.sourceLabel}` : ''}
                                </a>
                            </div>
                        )}
                    </div>
                )}

                {currentStep.type === "image" && (
                    <div className="w-full space-y-2">
                        <img
                            src={currentStep.url}
                            alt={currentStep.alt || "Lesson image"}
                            className="w-full h-64 object-cover rounded-lg" // Placeholder styling
                        />
                        {currentStep.alt && <p className="text-sm text-gray-500 text-center">{currentStep.alt}</p>}
                    </div>
                )}

                {currentStep.type === "quiz" && (
                    <div className="w-full space-y-6">
                        <h3 className="text-xl font-semibold text-center">{currentStep.question}</h3>
                        <div className="space-y-3">
                            {currentStep.options?.map((opt, idx) => {
                                const isSelected = quizSelected === opt;
                                let styleClass = "border-gray-200 hover:border-blue-500";

                                if (quizSubmitted) {
                                    if (opt === currentStep.answer) styleClass = "border-green-500 bg-green-50 text-green-700";
                                    else if (isSelected && opt !== currentStep.answer) styleClass = "border-red-500 bg-red-50 text-red-700";
                                    else styleClass = "border-gray-200 opacity-50";
                                } else if (isSelected) {
                                    styleClass = "border-blue-600 bg-blue-50 ring-1 ring-blue-600";
                                }

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => !quizSubmitted && setQuizSelected(opt)}
                                        className={`w-full p-4 text-left border rounded-lg transition-all ${styleClass}`}
                                        disabled={quizSubmitted}
                                    >
                                        {opt}
                                    </button>
                                );
                            })}
                        </div>
                        {quizSubmitted && currentStep.explanation && (
                            <div style={{
                                marginTop: '0.5rem',
                                padding: '0.75rem 1rem',
                                background: isQuizCorrect ? '#f0fdf4' : '#fef2f2',
                                border: `1px solid ${isQuizCorrect ? '#bbf7d0' : '#fecaca'}`,
                                borderRadius: '0.5rem',
                                fontSize: '0.9rem',
                                color: isQuizCorrect ? '#166534' : '#991b1b',
                                lineHeight: 1.5,
                            }}>
                                <strong>💡 Explanation:</strong> {currentStep.explanation}
                            </div>
                        )}
                        {isQuizWrong && !currentStep.explanation && (
                            <div style={{
                                padding: '0.75rem 1rem',
                                background: '#fef2f2',
                                border: '1px solid #fecaca',
                                borderRadius: '0.5rem',
                                fontSize: '0.9rem',
                                color: '#991b1b',
                                fontWeight: 600,
                            }}>
                                ❌ That's not quite right. Try again!
                            </div>
                        )}
                        {isQuizCorrect && !currentStep.explanation && (
                            <div style={{
                                padding: '0.75rem 1rem',
                                background: '#f0fdf4',
                                border: '1px solid #bbf7d0',
                                borderRadius: '0.5rem',
                                fontSize: '0.9rem',
                                color: '#166534',
                                fontWeight: 600,
                            }}>
                                ✅ Correct! Well done.
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="p-6 border-t bg-gray-50 flex gap-3">
                {/* Back button */}
                {currentStepIndex > 0 && (
                    <button
                        onClick={handlePrev}
                        className="py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 flex items-center gap-1"
                    >
                        <ChevronLeft size={18} />
                        Back
                    </button>
                )}

                {/* Next / Check / Try Again button */}
                <button
                    onClick={isQuizWrong ? handleRetry : handleNext}
                    disabled={nextDisabled}
                    className="flex-1 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {isQuizWrong ? (
                        <>
                            <RotateCcw size={16} />
                            Try Again
                        </>
                    ) : (
                        <>
                            {nextButtonLabel}
                            <ChevronRight size={18} />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
