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

        // Get requesting user's rank (always global, not filtered by department)
        const allRanked = await prisma.userGamification.findMany({
            where: { user: { role: 'LEARNER' } },
            orderBy: { totalXP: 'desc' },
            select: { userId: true },
        })
        const myRank = allRanked.findIndex((r) => r.userId === session.user.id) + 1
        const totalUsers = allRanked.length
        const percentile = totalUsers > 0 ? Math.round(((totalUsers - myRank) / totalUsers) * 100) : 0

        // Department rankings
        const deptUsers = await prisma.user.findMany({
            where: { role: 'LEARNER', department: { not: null } },
            select: { department: true, gamification: { select: { totalXP: true } } },
        })

        const deptMap = new Map<string, { count: number; totalXP: number }>()
        for (const u of deptUsers) {
            if (!u.department) continue
            const existing = deptMap.get(u.department) || { count: 0, totalXP: 0 }
            existing.count++
            existing.totalXP += u.gamification?.totalXP ?? 0
            deptMap.set(u.department, existing)
        }

        const departmentRankings = Array.from(deptMap.entries())
            .map(([name, data]) => ({
                name,
                count: data.count,
                totalXP: data.totalXP,
                avgXP: data.count > 0 ? Math.round(data.totalXP / data.count) : 0,
            }))
            .sort((a, b) => b.avgXP - a.avgXP)

        return NextResponse.json({
            leaderboard,
            myRank: myRank || null,
            totalUsers,
            percentile,
            departmentRankings,
        })
    } catch (error) {
        console.error('Failed to fetch leaderboard', error)
        return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
    }
}
