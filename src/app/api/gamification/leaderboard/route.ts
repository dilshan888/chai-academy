import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getLevelTitle } from '@/lib/gamification'

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { searchParams } = new URL(req.url)
        const department = searchParams.get('department')
        const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)

        // Build user filter
        const userFilter: Record<string, unknown> = { role: 'LEARNER' }
        if (department) {
            userFilter.department = department
        }

        // Get leaderboard entries
        const entries = await prisma.userGamification.findMany({
            where: {
                user: userFilter,
            },
            orderBy: { totalXP: 'desc' },
            take: limit,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        department: true,
                    },
                },
            },
        })

        // Get badge counts for these users
        const userIds = entries.map((e) => e.userId)
        const badgeCounts = await prisma.userAchievement.groupBy({
            by: ['userId'],
            where: { userId: { in: userIds } },
            _count: { userId: true },
        })
        const badgeMap = new Map(badgeCounts.map((b) => [b.userId, b._count.userId]))

        const leaderboard = entries.map((entry, index) => ({
            rank: index + 1,
            userId: entry.userId,
            name: entry.user.name || 'Anonymous',
            department: entry.user.department,
            totalXP: entry.totalXP,
            level: entry.level,
            levelTitle: getLevelTitle(entry.level),
            badgeCount: badgeMap.get(entry.userId) ?? 0,
        }))

        // Get requesting user's rank
        const allRanked = await prisma.userGamification.findMany({
            where: { user: userFilter },
            orderBy: { totalXP: 'desc' },
            select: { userId: true },
        })
        const myRank = allRanked.findIndex((r) => r.userId === session.user.id) + 1
        const totalUsers = allRanked.length
        const percentile = totalUsers > 0 ? Math.round(((totalUsers - myRank) / totalUsers) * 100) : 0

        return NextResponse.json({
            leaderboard,
            myRank: myRank || null,
            totalUsers,
            percentile,
        })
    } catch (error) {
        console.error('Failed to fetch leaderboard', error)
        return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
    }
}
