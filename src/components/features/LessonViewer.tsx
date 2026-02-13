"use client";

import { useState } from "react";
import { Check, ChevronRight, RotateCcw } from "lucide-react";

type BlockType = "text" | "quiz" | "image";

export interface LessonStep {
    type: BlockType;
    content?: string;
    question?: string;
    options?: string[];
    answer?: string;
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

    const handleNext = () => {
        if (currentStep.type === "quiz") {
            if (!quizSubmitted) {
                setQuizSubmitted(true);
                // Don't advance if wrong? Or just show feedback?
                // Simple version: Show feedback, require correct?
                // Let's just require selection.
                if (quizSelected !== currentStep.answer) {
                    // Maybe block? For now just let them pass or wait.
                    // If we want strict mode: return;
                }
            } else {
                advance();
            }
        } else {
            advance();
        }
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
                    <div className="prose text-lg text-center font-medium">
                        {currentStep.content}
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
                                // If submitted, show correct/incorrect
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
                    </div>
                )}
            </div>

            <div className="p-6 border-t bg-gray-50">
                <button
                    onClick={handleNext}
                    disabled={currentStep.type === "quiz" && !quizSelected && !quizSubmitted}
                    className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {currentStep.type === "quiz" && !quizSubmitted ? "Check Answer" : (isLastStep ? "Finish" : "Next")}
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
}
