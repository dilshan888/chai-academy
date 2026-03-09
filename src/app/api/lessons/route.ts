import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/lessons
// Fetch all lessons (metadata only, or with limited content)
// Supports optional ?moduleId=xxx query param to filter by module
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const moduleId = searchParams.get("moduleId");

        const lessons = await prisma.lesson.findMany({
            where: moduleId ? { moduleId } : undefined,
            orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
            select: {
                id: true,
                title: true,
                slug: true,
                description: true,
                difficulty: true,
                sortOrder: true,
                moduleId: true,
                createdAt: true,
                updatedAt: true,
                module: {
                    select: {
                        id: true,
                        title: true,
                        phase: {
                            select: {
                                id: true,
                                title: true,
                            },
                        },
                    },
                },
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
        // Admin-only protection
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json();
        const { title, slug, description, difficulty, steps, moduleId, sortOrder } = body;

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
                    moduleId: moduleId || null,
                    sortOrder: sortOrder ?? 0,
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
