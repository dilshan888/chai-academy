"use client";

import { useRouter } from "next/navigation";
import LessonViewer, { LessonStep } from "./LessonViewer";

interface LessonViewerContainerProps {
    lessonId: string;
    lessonTitle?: string;
    steps: LessonStep[];
}

export default function LessonViewerContainer({ lessonId, lessonTitle, steps }: LessonViewerContainerProps) {
    const router = useRouter();

    const handleComplete = async () => {
        try {
            await fetch(`/api/lessons/${lessonId}/progress`, {
                method: "POST",
                body: JSON.stringify({ completed: true }),
            });
        } catch (e) {
            console.error("Failed to save progress", e);
        }
    };

    return <LessonViewer lessonId={lessonId} lessonTitle={lessonTitle} initialSteps={steps} onComplete={handleComplete} />;
}

