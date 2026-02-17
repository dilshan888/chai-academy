import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { awardXP, updateStreak, checkAndAwardBadges } from '@/lib/gamification'

interface ScenarioOption {
    id: string
    isOptimal?: boolean
}

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { id } = await params
        const { chosenOption } = await req.json()

        if (!chosenOption) {
            return NextResponse.json({ error: 'chosenOption is required' }, { status: 400 })
        }

        const scenario = await prisma.scenario.findUnique({ where: { id } })
        if (!scenario) {
            return NextResponse.json({ error: 'Scenario not found' }, { status: 404 })
        }

        // Check if already responded
        const existing = await prisma.scenarioResponse.findUnique({
            where: {
                userId_scenarioId: {
                    userId: session.user.id,
                    scenarioId: id,
                },
            },
        })

        if (existing) {
            return NextResponse.json({ error: 'Already responded to this scenario' }, { status: 409 })
        }

        // Save response
        await prisma.scenarioResponse.create({
            data: {
                userId: session.user.id,
                scenarioId: id,
                chosenOption,
            },
        })

        // Award XP
        const options = scenario.options as unknown as ScenarioOption[]
        const isOptimal = options.find((o) => o.id === chosenOption)?.isOptimal ?? false
        const bonusXP = isOptimal ? 20 : 0
        const totalXP = isOptimal ? (scenario.xpReward + bonusXP) : 0

        await awardXP(session.user.id, totalXP, 'Scenario Complete', id)
        await updateStreak(session.user.id)
        const newBadges = await checkAndAwardBadges(session.user.id)

        return NextResponse.json({
            success: true,
            xpGained: totalXP,
            isOptimal,
            bonusXP,
            newBadges,
        })
    } catch (error) {
        console.error('Failed to respond to scenario', error)
        return NextResponse.json({ error: 'Failed to submit response' }, { status: 500 })
    }
}
