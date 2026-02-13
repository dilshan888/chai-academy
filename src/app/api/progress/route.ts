import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET: Fetch progress for current user
export async function GET() {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const progress = await prisma.progress.findMany({
            where: { userId: session.user.id },
            select: { lessonId: true }
        })

        // Return just the array of IDs like [1, 2]
        const completedLessonIds = progress.map((p: any) => p.lessonId)
        return NextResponse.json({ completedLessons: completedLessonIds })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 })
    }
}

// POST: Mark lesson as complete
export async function POST(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { lessonId } = await req.json()

        if (!lessonId) {
            return NextResponse.json({ error: 'Lesson ID required' }, { status: 400 })
        }

        // Upsert progress (create if not exists)
        await prisma.progress.upsert({
            where: {
                userId_lessonId: {
                    userId: session.user.id,
                    lessonId: String(lessonId)
                }
            },
            update: { completed: true, completedAt: new Date() },
            create: {
                userId: session.user.id,
                lessonId: String(lessonId),
                completed: true
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to save progress' }, { status: 500 })
    }
}
