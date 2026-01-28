import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        // Test database connection by counting users
        const userCount = await prisma.user.count();
        const courseCount = await prisma.course.count();
        const lessonCount = await prisma.lesson.count();

        return NextResponse.json(
            {
                status: "connected",
                database: "supabase",
                timestamp: new Date().toISOString(),
                stats: {
                    users: userCount,
                    courses: courseCount,
                    lessons: lessonCount,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            {
                status: "error",
                message: error instanceof Error ? error.message : "Database connection failed",
                timestamp: new Date().toISOString(),
            },
            { status: 500 }
        );
    }
}
