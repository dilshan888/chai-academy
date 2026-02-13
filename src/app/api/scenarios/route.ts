import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { searchParams } = new URL(req.url)
        const lessonId = searchParams.get('lessonId')

        const where = lessonId ? { lessonId: parseInt(lessonId) } : {}

        const scenarios = await prisma.scenario.findMany({
            where,
            orderBy: { sortOrder: 'asc' },
            select: {
                id: true,
                lessonId: true,
                title: true,
                riskLevel: true,
                xpReward: true,
                sortOrder: true,
            },
        })

        // Get user's responses to check which are completed
        const responses = await prisma.scenarioResponse.findMany({
            where: { userId: session.user.id },
            select: { scenarioId: true },
        })
        const completedIds = new Set(responses.map((r) => r.scenarioId))

        const result = scenarios.map((s) => ({
            ...s,
            completed: completedIds.has(s.id),
        }))

        return NextResponse.json({ scenarios: result })
    } catch (error) {
        console.error('Failed to fetch scenarios', error)
        return NextResponse.json({ error: 'Failed to fetch scenarios' }, { status: 500 })
    }
}
