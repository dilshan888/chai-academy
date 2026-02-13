import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { id } = await params

        const scenario = await prisma.scenario.findUnique({
            where: { id },
        })

        if (!scenario) {
            return NextResponse.json({ error: 'Scenario not found' }, { status: 404 })
        }

        // Check if user already responded
        const existingResponse = await prisma.scenarioResponse.findUnique({
            where: {
                userId_scenarioId: {
                    userId: session.user.id,
                    scenarioId: id,
                },
            },
        })

        return NextResponse.json({
            scenario,
            userResponse: existingResponse?.chosenOption ?? null,
        })
    } catch (error) {
        console.error('Failed to fetch scenario', error)
        return NextResponse.json({ error: 'Failed to fetch scenario' }, { status: 500 })
    }
}
