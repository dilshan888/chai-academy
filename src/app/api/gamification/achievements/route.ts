import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        // Get all achievements
        const achievements = await prisma.achievement.findMany({
            orderBy: { sortOrder: 'asc' },
        })

        // Get user's unlocked achievements
        const userAchievements = await prisma.userAchievement.findMany({
            where: { userId: session.user.id },
            select: { achievementId: true, unlockedAt: true },
        })
        const unlockedMap = new Map(
            userAchievements.map((ua) => [ua.achievementId, ua.unlockedAt])
        )

        const result = achievements.map((a) => ({
            id: a.id,
            slug: a.slug,
            title: a.title,
            description: a.description,
            iconEmoji: a.iconEmoji,
            category: a.category,
            xpReward: a.xpReward,
            unlocked: unlockedMap.has(a.id),
            unlockedAt: unlockedMap.get(a.id) ?? null,
        }))

        return NextResponse.json({ achievements: result })
    } catch (error) {
        console.error('Failed to fetch achievements', error)
        return NextResponse.json({ error: 'Failed to fetch achievements' }, { status: 500 })
    }
}
