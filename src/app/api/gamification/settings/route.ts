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
        // Get global gamification setting
        const setting = await prisma.systemSetting.findUnique({
            where: { key: 'GAMIFICATION_ENABLED' }
        })
        const gamificationEnabled = setting ? setting.value === 'true' : true // Default true

        // Get user preference
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { optOutOfLeaderboard: true }
        })

        return NextResponse.json({
            globalGamificationEnabled: gamificationEnabled,
            userOptOutOfLeaderboard: user?.optOutOfLeaderboard ?? false
        })
    } catch (error) {
        console.error('Failed to fetch gamification settings', error)
        return NextResponse.json({ error: 'Failed to fetch gamification settings' }, { status: 500 })
    }
}
