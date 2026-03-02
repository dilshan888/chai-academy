import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const days = parseInt(searchParams.get('days') || '30', 10)
    const since = new Date()
    since.setDate(since.getDate() - days)

    try {
        // --- 1. Engagement over time: XP earned per day ---
        const xpTransactions = await prisma.xPTransaction.findMany({
            where: { createdAt: { gte: since } },
            select: { amount: true, createdAt: true },
            orderBy: { createdAt: 'asc' },
        })

        // Group XP by date
        const xpByDate = new Map<string, number>()
        for (const tx of xpTransactions) {
            const dateKey = tx.createdAt.toISOString().split('T')[0]
            xpByDate.set(dateKey, (xpByDate.get(dateKey) || 0) + tx.amount)
        }

        // --- 2. Daily active learners from StreakRecord ---
        const streakRecords = await prisma.streakRecord.findMany({
            where: { date: { gte: since } },
            select: { userId: true, date: true },
        })

        const activeByDate = new Map<string, Set<string>>()
        for (const rec of streakRecords) {
            const dateKey = rec.date.toISOString().split('T')[0]
            if (!activeByDate.has(dateKey)) activeByDate.set(dateKey, new Set())
            activeByDate.get(dateKey)!.add(rec.userId)
        }

        // Build engagement timeline (fill in missing days with 0)
        const engagementTimeline: { date: string; xp: number; activeUsers: number }[] = []
        const cursor = new Date(since)
        const today = new Date()
        while (cursor <= today) {
            const dateKey = cursor.toISOString().split('T')[0]
            engagementTimeline.push({
                date: dateKey,
                xp: xpByDate.get(dateKey) || 0,
                activeUsers: activeByDate.get(dateKey)?.size || 0,
            })
            cursor.setDate(cursor.getDate() + 1)
        }

        // --- 3. Lesson completion rates ---
        const totalLearners = await prisma.user.count({ where: { role: 'LEARNER' } })

        const lessons = await prisma.lesson.findMany({
            select: {
                id: true,
                title: true,
                _count: { select: { progress: true } },
            },
        })

        // Get completed counts per lesson
        const completedCounts = await prisma.progress.groupBy({
            by: ['lessonId'],
            where: { completed: true },
            _count: { _all: true },
        })

        const completedMap = new Map<string, number>()
        for (const c of completedCounts) {
            completedMap.set(c.lessonId, c._count._all)
        }

        const lessonPerformance = lessons.map((lesson) => {
            const completed = completedMap.get(lesson.id) || 0
            const rate = totalLearners > 0 ? Math.round((completed / totalLearners) * 100) : 0
            return {
                id: lesson.id,
                title: lesson.title,
                completedCount: completed,
                totalLearners,
                completionRate: rate,
            }
        })

        // Sort by completion rate ascending to find bottlenecks first
        lessonPerformance.sort((a, b) => a.completionRate - b.completionRate)

        // --- 4. Scenario decision analysis ---
        const scenarios = await prisma.scenario.findMany({
            select: {
                id: true,
                title: true,
                riskLevel: true,
                options: true,
                responses: {
                    select: { chosenOption: true },
                },
            },
        })

        const scenarioAnalysis = scenarios.map((scenario) => {
            const options = scenario.options as Array<{
                id: string
                label: string
                isOptimal?: boolean
            }>
            const totalResponses = scenario.responses.length
            const optimalOption = options.find((o) => o.isOptimal)
            const optimalCount = optimalOption
                ? scenario.responses.filter((r) => r.chosenOption === optimalOption.id).length
                : 0
            const optimalRate = totalResponses > 0
                ? Math.round((optimalCount / totalResponses) * 100)
                : 0

            return {
                id: scenario.id,
                title: scenario.title,
                riskLevel: scenario.riskLevel,
                totalResponses,
                optimalCount,
                optimalRate,
            }
        })

        // Aggregate scenario risk level distribution
        const riskDistribution: Record<string, number> = {}
        for (const s of scenarioAnalysis) {
            if (s.totalResponses > 0) {
                riskDistribution[s.riskLevel] = (riskDistribution[s.riskLevel] || 0) + s.totalResponses
            }
        }

        // Overall optimal rate across all scenarios
        const totalScenarioResponses = scenarioAnalysis.reduce((s, a) => s + a.totalResponses, 0)
        const totalOptimal = scenarioAnalysis.reduce((s, a) => s + a.optimalCount, 0)
        const overallOptimalRate = totalScenarioResponses > 0
            ? Math.round((totalOptimal / totalScenarioResponses) * 100)
            : 0

        // --- 5. Department leaderboard ---
        const users = await prisma.user.findMany({
            where: { role: 'LEARNER' },
            select: {
                department: true,
                gamification: { select: { totalXP: true } },
                progress: { where: { completed: true }, select: { id: true } },
            },
        })

        const totalLessonCount = await prisma.lesson.count()
        const deptMap = new Map<string, { count: number; totalXP: number; totalCompleted: number }>()
        for (const u of users) {
            const dept = u.department || 'Unassigned'
            const existing = deptMap.get(dept) || { count: 0, totalXP: 0, totalCompleted: 0 }
            existing.count++
            existing.totalXP += u.gamification?.totalXP ?? 0
            existing.totalCompleted += u.progress.length
            deptMap.set(dept, existing)
        }

        const departmentLeaderboard = Array.from(deptMap.entries())
            .map(([name, data]) => ({
                name,
                learners: data.count,
                avgXP: data.count > 0 ? Math.round(data.totalXP / data.count) : 0,
                avgCompletion: data.count > 0 && totalLessonCount > 0
                    ? Math.round((data.totalCompleted / (data.count * totalLessonCount)) * 100)
                    : 0,
                totalXP: data.totalXP,
            }))
            .sort((a, b) => b.avgXP - a.avgXP)

        // --- 6. Summary stats for the selected period ---
        const periodXP = xpTransactions.reduce((s, t) => s + t.amount, 0)
        const uniqueActiveDays = activeByDate.size
        const newCompletions = await prisma.progress.count({
            where: { completed: true, completedAt: { gte: since } },
        })

        return NextResponse.json({
            period: { days, since: since.toISOString() },
            summary: {
                periodXP,
                activeDays: uniqueActiveDays,
                newCompletions,
                totalLearners,
                overallOptimalRate,
                totalScenarioResponses,
            },
            engagementTimeline,
            lessonPerformance,
            scenarioAnalysis,
            riskDistribution,
            departmentLeaderboard,
        })
    } catch (error) {
        console.error('Failed to fetch analytics', error)
        return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
    }
}
