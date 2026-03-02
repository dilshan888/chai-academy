import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/modules/[id]
// Fetch a specific module by ID, including phase info and lessons
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const module = await prisma.module.findUnique({
            where: { id },
            include: {
                phase: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
                lessons: {
                    orderBy: { sortOrder: "asc" },
                },
            },
        });

        if (!module) {
            return NextResponse.json(
                { error: "Module not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(module);
    } catch (error) {
        console.error("Error fetching module:", error);
        return NextResponse.json(
            { error: "Failed to fetch module" },
            { status: 500 }
        );
    }
}

// PATCH /api/modules/[id]
// Update a module (admin only)
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
        const { title, slug, description, sortOrder, phaseId } = body;

        const updatedModule = await prisma.module.update({
            where: { id },
            data: {
                title,
                slug,
                description,
                sortOrder,
                phaseId,
            },
        });

        return NextResponse.json(updatedModule);
    } catch (error: any) {
        console.error("Error updating module:", error);

        // Handle unique slug error
        if (error.code === 'P2002') {
            return NextResponse.json(
                { error: "A module with this slug already exists" },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: "Failed to update module" },
            { status: 500 }
        );
    }
}

// DELETE /api/modules/[id]
// Delete a module (admin only)
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

        await prisma.module.delete({
            where: { id },
        });

        return NextResponse.json({ message: "Module deleted successfully" });
    } catch (error) {
        console.error("Error deleting module:", error);
        return NextResponse.json(
            { error: "Failed to delete module" },
            { status: 500 }
        );
    }
}
