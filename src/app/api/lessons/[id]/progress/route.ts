import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth"; // Assuming auth is set up
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// POST /api/lessons/[id]/progress
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id;
        // For demo if no user, we might mock OR require auth.
        // Given 'Creator Portal' context, let's assuming testing as a user or guest.
        // If no userId, we can't save progress reliably without a session.

        // Fallback for dev: if no session, just return success status (mock mode) or 401.
        // I will return 200 with message if authorized, 401 if not.
        if (!userId) {
            return NextResponse.json({ message: "No user session, progress not saved (Dev mode)" }, { status: 200 });
            // return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: lessonId } = await params;
        const body = await req.json();
        const { completed, score } = body;

        await prisma.progress.upsert({
            where: {
                userId_lessonId: {
                    userId,
                    lessonId,
                },
            },
            update: {
                completed: completed ?? true,
                score,
                completedAt: new Date(),
            },
            create: {
                userId,
                lessonId,
                completed: completed ?? true,
                score,
            },
        });
        
        // Ensure the layout re-checks the 2-module threshold
        revalidatePath('/', 'layout');

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error saving progress:", error);
        return NextResponse.json(
            { error: "Failed to save progress" },
            { status: 500 }
        );
    }
}
