import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/phases
// Fetch all phases ordered by sortOrder, include module count
export async function GET() {
    try {
        const phases = await prisma.phase.findMany({
            orderBy: { sortOrder: "asc" },
            include: {
                _count: {
                    select: { modules: true },
                },
            },
        });
        return NextResponse.json(phases);
    } catch (error) {
        console.error("Error fetching phases:", error);
        return NextResponse.json(
            { error: "Failed to fetch phases" },
            { status: 500 }
        );
    }
}

// POST /api/phases
// Create a new phase
export async function POST(req: Request) {
    try {
        // Admin-only protection
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json();
        const { title, slug, description, sortOrder } = body;

        // Basic validation
        if (!title || !slug) {
            return NextResponse.json(
                { error: "Missing required fields: title, slug" },
                { status: 400 }
            );
        }

        const phase = await prisma.phase.create({
            data: {
                title,
                slug,
                description,
                sortOrder: sortOrder ?? 0,
            },
        });

        return NextResponse.json(phase, { status: 201 });
    } catch (error: any) {
        console.error("Error creating phase:", error);

        // Handle unique slug error
        if (error.code === 'P2002') {
            return NextResponse.json(
                { error: "A phase with this slug already exists" },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: "Failed to create phase" },
            { status: 500 }
        );
    }
}
