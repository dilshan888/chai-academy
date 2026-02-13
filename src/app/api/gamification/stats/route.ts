import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserStats } from '@/lib/gamification'

export async function GET() {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const stats = await getUserStats(session.user.id)
        return NextResponse.json(stats)
    } catch (error) {
        console.error('Failed to fetch gamification stats', error)
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
    }
}
