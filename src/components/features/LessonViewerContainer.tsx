"use client";

import { useRouter } from "next/navigation";
import LessonViewer, { LessonStep } from "./LessonViewer";

interface LessonViewerContainerProps {
    lessonId: string;
    steps: LessonStep[];
}

export default function LessonViewerContainer({ lessonId, steps }: LessonViewerContainerProps) {
    const router = useRouter();

    const handleComplete = async () => {
        try {
            await fetch(`/api/lessons/${lessonId}/progress`, {
                method: "POST",
                body: JSON.stringify({ completed: true }),
            });
            // Optional: Redirect or show confetti
            // router.push('/dashboard'); 
        } catch (e) {
            console.error("Failed to save progress", e);
        }
    };

    return <LessonViewer lessonId={lessonId} initialSteps={steps} onComplete={handleComplete} />;
}
