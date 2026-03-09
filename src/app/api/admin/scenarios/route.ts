import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/scenarios?lessonId=xxx  — fetch the scenario attached to a lesson
export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const lessonId = searchParams.get('lessonId')

    if (!lessonId) {
        return NextResponse.json({ error: 'lessonId is required' }, { status: 400 })
    }

    try {
        const scenario = await prisma.scenario.findUnique({
            where: { lessonId },
        })
        return NextResponse.json({ scenario })
    } catch (error) {
        console.error('Failed to fetch scenario', error)
        return NextResponse.json({ error: 'Failed to fetch scenario' }, { status: 500 })
    }
}

// POST /api/admin/scenarios  — create a new scenario for a lesson
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    try {
        const body = await req.json()
        const { lessonId, title, riskLevel, situation, prompt, options, proTip, xpReward } = body

        if (!lessonId || !title || !riskLevel || !situation || !prompt || !options || !proTip) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Verify lesson exists
        const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } })
        if (!lesson) {
            return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
        }

        // Check if a scenario already exists for this lesson
        const existing = await prisma.scenario.findUnique({ where: { lessonId } })
        if (existing) {
            return NextResponse.json({ error: 'A scenario already exists for this lesson. Use PUT to update it.' }, { status: 409 })
        }

        const scenario = await prisma.scenario.create({
            data: {
                lessonId,
                title,
                riskLevel,
                situation,
                prompt,
                options,
                proTip,
                xpReward: xpReward ?? 30,
            },
        })

        return NextResponse.json({ scenario }, { status: 201 })
    } catch (error) {
        console.error('Failed to create scenario', error)
        return NextResponse.json({ error: 'Failed to create scenario' }, { status: 500 })
    }
}

// PUT /api/admin/scenarios  — update an existing scenario (by lessonId in body)
export async function PUT(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    try {
        const body = await req.json()
        const { lessonId, title, riskLevel, situation, prompt, options, proTip, xpReward } = body

        if (!lessonId) {
            return NextResponse.json({ error: 'lessonId is required' }, { status: 400 })
        }

        const existing = await prisma.scenario.findUnique({ where: { lessonId } })
        if (!existing) {
            return NextResponse.json({ error: 'Scenario not found for this lesson' }, { status: 404 })
        }

        const scenario = await prisma.scenario.update({
            where: { lessonId },
            data: {
                ...(title !== undefined && { title }),
                ...(riskLevel !== undefined && { riskLevel }),
                ...(situation !== undefined && { situation }),
                ...(prompt !== undefined && { prompt }),
                ...(options !== undefined && { options }),
                ...(proTip !== undefined && { proTip }),
                ...(xpReward !== undefined && { xpReward }),
            },
        })

        return NextResponse.json({ scenario })
    } catch (error) {
        console.error('Failed to update scenario', error)
        return NextResponse.json({ error: 'Failed to update scenario' }, { status: 500 })
    }
}

// DELETE /api/admin/scenarios?lessonId=xxx  — delete a scenario
export async function DELETE(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const lessonId = searchParams.get('lessonId')

    if (!lessonId) {
        return NextResponse.json({ error: 'lessonId is required' }, { status: 400 })
    }

    try {
        const existing = await prisma.scenario.findUnique({ where: { lessonId } })
        if (!existing) {
            return NextResponse.json({ error: 'Scenario not found' }, { status: 404 })
        }

        await prisma.scenario.delete({ where: { lessonId } })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Failed to delete scenario', error)
        return NextResponse.json({ error: 'Failed to delete scenario' }, { status: 500 })
    }
}
