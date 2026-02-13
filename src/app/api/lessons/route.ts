import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/lessons
// Fetch all lessons (metadata only, or with limited content)
export async function GET() {
    try {
        const lessons = await prisma.lesson.findMany({
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                title: true,
                slug: true,
                description: true,
                difficulty: true,
                createdAt: true,
                updatedAt: true,
                // Not selecting 'content' to keep the list lightweight
            },
        });
        return NextResponse.json(lessons);
    } catch (error) {
        console.error("Error fetching lessons:", error);
        return NextResponse.json(
            { error: "Failed to fetch lessons" },
            { status: 500 }
        );
    }
}

// POST /api/lessons
// Create a new lesson
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { title, slug, description, difficulty, steps } = body;

        // Basic validation
        if (!title || !slug || !steps) {
            return NextResponse.json(
                { error: "Missing required fields: title, slug, steps" },
                { status: 400 }
            );
        }

        // Transaction to create Lesson and its Content
        const lesson = await prisma.$transaction(async (tx) => {
            // Create the Lesson metadata
            const newLesson = await tx.lesson.create({
                data: {
                    title,
                    slug,
                    description,
                    difficulty: difficulty || "beginner",
                },
            });

            // Create the Lesson Content
            await tx.lessonContent.create({
                data: {
                    lessonId: newLesson.id,
                    steps: steps, // Prisma handles JSON serialization
                },
            });

            return newLesson;
        });

        return NextResponse.json(lesson, { status: 201 });
    } catch (error: any) {
        console.error("Error creating lesson:", error);

        // Handle unique slug error
        if (error.code === 'P2002') {
            return NextResponse.json(
                { error: "A lesson with this slug already exists" },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: "Failed to create lesson" },
            { status: 500 }
        );
    }
}
