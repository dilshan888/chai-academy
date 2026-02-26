import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest) {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { optOutOfLeaderboard } = body

        if (typeof optOutOfLeaderboard !== 'boolean') {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
        }

        await prisma.user.update({
            where: { id: session.user.id },
            data: { optOutOfLeaderboard }
        })

        return NextResponse.json({ success: true, optOutOfLeaderboard })
    } catch (error) {
        console.error('Failed to update user preferences', error)
        return NextResponse.json({ error: 'Failed to update user preferences' }, { status: 500 })
    }
}
