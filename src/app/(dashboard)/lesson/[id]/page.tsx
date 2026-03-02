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
        <div style={{ padding: '0 1rem' }}>
            <LessonViewerContainer lessonId={lesson.id} lessonTitle={lesson.title} steps={steps} />
        </div>
    );
}
