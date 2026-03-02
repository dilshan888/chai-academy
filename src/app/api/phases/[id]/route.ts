import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/phases/[id]
// Fetch a specific phase by ID, including its modules with lesson counts
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const phase = await prisma.phase.findUnique({
            where: { id },
            include: {
                modules: {
                    orderBy: { sortOrder: "asc" },
                    include: {
                        _count: {
                            select: { lessons: true },
                        },
                    },
                },
            },
        });

        if (!phase) {
            return NextResponse.json(
                { error: "Phase not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(phase);
    } catch (error) {
        console.error("Error fetching phase:", error);
        return NextResponse.json(
            { error: "Failed to fetch phase" },
            { status: 500 }
        );
    }
}

// PATCH /api/phases/[id]
// Update a phase
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Admin-only protection
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { id } = await params;
        const body = await req.json();
        const { title, slug, description, sortOrder } = body;

        const updatedPhase = await prisma.phase.update({
            where: { id },
            data: {
                title,
                slug,
                description,
                sortOrder,
            },
        });

        return NextResponse.json(updatedPhase);
    } catch (error: any) {
        console.error("Error updating phase:", error);

        // Handle unique slug error
        if (error.code === 'P2002') {
            return NextResponse.json(
                { error: "A phase with this slug already exists" },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: "Failed to update phase" },
            { status: 500 }
        );
    }
}

// DELETE /api/phases/[id]
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Admin-only protection
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { id } = await params;

        await prisma.phase.delete({
            where: { id },
        });

        return NextResponse.json({ message: "Phase deleted successfully" });
    } catch (error) {
        console.error("Error deleting phase:", error);
        return NextResponse.json(
            { error: "Failed to delete phase" },
            { status: 500 }
        );
    }
}
