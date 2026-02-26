import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions)

    // Ensure only admins can fetch all settings here
    if (!session?.user || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const settings = await prisma.systemSetting.findMany()
        const settingsMap = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value
            return acc
        }, {} as Record<string, string>)

        return NextResponse.json(settingsMap)
    } catch (error) {
        console.error('Failed to fetch settings', error)
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions)

    // Ensure only admins can update this
    if (!session?.user || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await req.json()
        const updates = []

        for (const [key, value] of Object.entries(body)) {
            if (typeof value === 'string') {
                updates.push(
                    prisma.systemSetting.upsert({
                        where: { key },
                        update: { value },
                        create: { key, value },
                    })
                )
            }
        }

        await prisma.$transaction(updates)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Failed to update settings', error)
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
    }
}
