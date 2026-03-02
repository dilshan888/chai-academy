import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/modules
// Fetch all modules ordered by sortOrder. Supports optional ?phaseId=xxx filter.
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const phaseId = searchParams.get("phaseId");

        const modules = await prisma.module.findMany({
            where: phaseId ? { phaseId } : undefined,
            orderBy: { sortOrder: "asc" },
            include: {
                phase: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
                _count: {
                    select: { lessons: true },
                },
            },
        });

        return NextResponse.json(modules);
    } catch (error) {
        console.error("Error fetching modules:", error);
        return NextResponse.json(
            { error: "Failed to fetch modules" },
            { status: 500 }
        );
    }
}

// POST /api/modules
// Create a new module (admin only)
export async function POST(req: Request) {
    try {
        // Admin-only protection
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json();
        const { title, slug, description, sortOrder, phaseId } = body;

        // Basic validation
        if (!title || !slug || !phaseId) {
            return NextResponse.json(
                { error: "Missing required fields: title, slug, phaseId" },
                { status: 400 }
            );
        }

        const module = await prisma.module.create({
            data: {
                title,
                slug,
                description,
                sortOrder: sortOrder ?? 0,
                phaseId,
            },
        });

        return NextResponse.json(module, { status: 201 });
    } catch (error: any) {
        console.error("Error creating module:", error);

        // Handle unique slug error
        if (error.code === 'P2002') {
            return NextResponse.json(
                { error: "A module with this slug already exists" },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: "Failed to create module" },
            { status: 500 }
        );
    }
}
