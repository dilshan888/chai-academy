import { prisma } from "@/lib/prisma";
import LessonViewerContainer from "@/components/features/LessonViewerContainer";
import { notFound } from "next/navigation";
import { LessonStep } from "@/components/features/LessonViewer";

export const dynamic = 'force-dynamic';

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const lesson = await prisma.lesson.findUnique({
        where: { id },
        include: { 
            content: true,
            module: {
                include: {
                    phase: true
                }
            }
        },
    });

    if (!lesson || !lesson.content) {
        notFound();
    }

    // Find next lesson
    let nextLessonId: string | null = null;
    
    if (lesson.moduleId) {
        // 1. Try next lesson in same module
        const nextInModule = await prisma.lesson.findFirst({
            where: {
                moduleId: lesson.moduleId,
                sortOrder: { gt: lesson.sortOrder }
            },
            orderBy: { sortOrder: 'asc' },
            select: { id: true }
        });

        if (nextInModule) {
            nextLessonId = nextInModule.id;
        } else if (lesson.module?.phaseId) {
            // 2. Try first lesson in next module (same phase)
            const nextModule = await prisma.module.findFirst({
                where: {
                    phaseId: lesson.module.phaseId,
                    sortOrder: { gt: lesson.module.sortOrder }
                },
                orderBy: { sortOrder: 'asc' },
                include: {
                    lessons: {
                        orderBy: { sortOrder: 'asc' },
                        take: 1,
                        select: { id: true }
                    }
                }
            });

            if (nextModule?.lessons?.[0]) {
                nextLessonId = nextModule.lessons[0].id;
            }
        }
    }

    // Cast Prisma Json to LessonStep[]
    const steps = lesson.content.steps as unknown as LessonStep[];

    return (
        <div style={{ padding: '0 1rem' }}>
            <LessonViewerContainer 
                lessonId={lesson.id} 
                lessonTitle={lesson.title} 
                steps={steps} 
                phaseSlug={lesson.module?.phase?.slug}
                nextLessonId={nextLessonId || undefined}
            />
        </div>
    );
}
