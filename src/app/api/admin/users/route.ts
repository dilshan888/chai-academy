import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getLevelTitle } from '@/lib/gamification'

export async function GET() {
    const session = await getServerSession(authOptions)

    if (!session || !session.user || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    try {
        const users = await prisma.user.findMany({
            where: { role: 'LEARNER' },
            include: {
                progress: true,
                gamification: true,
                achievements: true,
            },
        })

        const dashboardData = users.map((user) => {
            const completedCount = user.progress.filter((p) => p.completed).length
            const percentage = Math.round((completedCount / 6) * 100)

            return {
                id: user.id,
                name: user.name || 'Unknown',
                email: user.email,
                department: user.department || 'Unassigned',
                role: 'Staff',
                progress: percentage,
                totalXP: user.gamification?.totalXP ?? 0,
                level: user.gamification?.level ?? 1,
                levelTitle: getLevelTitle(user.gamification?.level ?? 1),
                currentStreak: user.gamification?.currentStreak ?? 0,
                badgeCount: user.achievements.length,
                lastActive: user.gamification?.lastActivityDate,
            }
        })

        // Sort by progress descending
        dashboardData.sort((a, b) => b.progress - a.progress)

        // Aggregate stats
        const totalLearners = dashboardData.length
        const avgCompletion = totalLearners > 0
            ? Math.round(dashboardData.reduce((acc, u) => acc + u.progress, 0) / totalLearners)
            : 0
        const certified = dashboardData.filter((u) => u.progress === 100).length
        const totalXPAll = dashboardData.reduce((acc, u) => acc + u.totalXP, 0)
        const avgXP = totalLearners > 0 ? Math.round(totalXPAll / totalLearners) : 0
        const activeLearners = dashboardData.filter((u) => u.currentStreak > 0).length

        // Department breakdown
        const deptMap = new Map<string, { count: number; totalProgress: number; totalXP: number }>()
        for (const u of dashboardData) {
            const dept = u.department
            const existing = deptMap.get(dept) || { count: 0, totalProgress: 0, totalXP: 0 }
            existing.count++
            existing.totalProgress += u.progress
            existing.totalXP += u.totalXP
            deptMap.set(dept, existing)
        }
        const departments = Array.from(deptMap.entries()).map(([name, data]) => ({
            name,
            count: data.count,
            avgProgress: Math.round(data.totalProgress / data.count),
            totalXP: data.totalXP,
        })).sort((a, b) => b.avgProgress - a.avgProgress)

        return NextResponse.json({
            users: dashboardData,
            stats: {
                totalLearners,
                avgCompletion,
                certified,
                avgXP,
                activeLearners,
            },
            departments,
        })
    } catch (error) {
        console.error('Failed to fetch admin users', error)
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }
}
