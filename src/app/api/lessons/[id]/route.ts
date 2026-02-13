import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/lessons/[id]
// Fetch a specific lesson by ID, including its content steps
export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        const lesson = await prisma.lesson.findUnique({
            where: { id },
            include: {
                content: true, // Include the JSON content
            },
        });

        if (!lesson) {
            return NextResponse.json(
                { error: "Lesson not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(lesson);
    } catch (error) {
        console.error("Error fetching lesson:", error);
        return NextResponse.json(
            { error: "Failed to fetch lesson" },
            { status: 500 }
        );
    }
}

// PATCH /api/lessons/[id]
// Update a lesson
export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const body = await req.json();
        const { title, slug, description, difficulty, steps } = body;

        const updatedLesson = await prisma.$transaction(async (tx) => {
            // Update metadata
            const lesson = await tx.lesson.update({
                where: { id },
                data: {
                    title,
                    slug,
                    description,
                    difficulty,
                },
            });

            // Update content if provided
            if (steps) {
                await tx.lessonContent.upsert({
                    where: { lessonId: id },
                    create: {
                        lessonId: id,
                        steps,
                    },
                    update: {
                        steps,
                    },
                });
            }

            return lesson;
        });

        return NextResponse.json(updatedLesson);
    } catch (error) {
        console.error("Error updating lesson:", error);
        return NextResponse.json(
            { error: "Failed to update lesson" },
            { status: 500 }
        );
    }
}

// DELETE /api/lessons/[id]
export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        await prisma.lesson.delete({
            where: { id },
        });

        return NextResponse.json({ message: "Lesson deleted successfully" });
    } catch (error) {
        console.error("Error deleting lesson:", error);
        return NextResponse.json(
            { error: "Failed to delete lesson" },
            { status: 500 }
        );
    }
}
