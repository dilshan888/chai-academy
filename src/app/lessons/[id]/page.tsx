import { prisma } from "@/lib/prisma";
import LessonViewerContainer from "@/components/features/LessonViewerContainer";
import { notFound } from "next/navigation";
import { LessonStep } from "@/components/features/LessonViewer";

export const dynamic = 'force-dynamic';

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const lesson = await prisma.lesson.findUnique({
        where: { id },
        include: { content: true },
    });

    if (!lesson || !lesson.content) {
        notFound();
    }

    // Cast Prisma Json to LessonStep[]
    const steps = lesson.content.steps as unknown as LessonStep[];

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4">
            <div className="max-w-2xl mx-auto mb-6">
                <h1 className="text-3xl font-bold text-gray-900">{lesson.title}</h1>
                <div className="flex gap-2 mt-2 text-sm text-gray-500 uppercase tracking-wide">
                    <span className="bg-white px-2 py-1 rounded border">{lesson.difficulty}</span>
                    <span className="bg-white px-2 py-1 rounded border">{steps.length} Steps</span>
                </div>
            </div>

            <LessonViewerContainer lessonId={lesson.id} steps={steps} />
        </div>
    );
}
