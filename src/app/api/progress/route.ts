import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { awardXP, updateStreak, checkAndAwardBadges, XP_AMOUNTS, getUserStats, createNotification } from '@/lib/gamification'

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

        const completedLessonIds = progress.map((p: { lessonId: string }) => p.lessonId)
        return NextResponse.json({ completedLessons: completedLessonIds })
    } catch {
        return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 })
    }
}

// POST: Mark lesson as complete + award XP + update streak + check badges
export async function POST(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { lessonId, score } = await req.json()

        if (!lessonId) {
            return NextResponse.json({ error: 'Lesson ID required' }, { status: 400 })
        }

        const userId = session.user.id

        // Check if already completed (avoid double XP)
        const existing = await prisma.progress.findUnique({
            where: {
                userId_lessonId: { userId, lessonId: String(lessonId) },
            },
        })

        const alreadyCompleted = existing?.completed === true

        // Upsert progress
        await prisma.progress.upsert({
            where: {
                userId_lessonId: { userId, lessonId: String(lessonId) },
            },
            update: {
                completed: true,
                completedAt: new Date(),
                score: score ?? existing?.score,
            },
            create: {
                userId,
                lessonId: String(lessonId),
                completed: true,
                score: score ?? null,
            },
        })

        // Only award XP for first-time completions
        let xpResult = null
        let streakResult = null
        let newBadges: Array<{ slug: string; title: string; iconEmoji: string; xpReward: number }> = []

        if (!alreadyCompleted) {
            // Award XP for lesson completion
            xpResult = await awardXP(userId, XP_AMOUNTS.LESSON_COMPLETE, 'lesson_complete', String(lessonId))

            // Update streak
            streakResult = await updateStreak(userId)

            // Check and award badges
            newBadges = await checkAndAwardBadges(userId)

            // Create lesson completion notification
            const lesson = await prisma.lesson.findUnique({
                where: { id: String(lessonId) },
                select: { title: true },
            })
            await createNotification(
                userId,
                'LESSON_COMPLETE',
                'Lesson Completed!',
                `You completed "${lesson?.title ?? 'a lesson'}" and earned ${xpResult.xpGained} XP.`
            )
        }

        // Get updated stats
        const stats = await getUserStats(userId)

        return NextResponse.json({
            success: true,
            firstCompletion: !alreadyCompleted,
            xpGained: xpResult?.xpGained ?? 0,
            leveledUp: xpResult?.leveledUp ?? false,
            newBadges,
            stats,
            streak: streakResult,
        })
    } catch (error) {
        console.error('Failed to save progress', error)
        return NextResponse.json({ error: 'Failed to save progress' }, { status: 500 })
    }
}
