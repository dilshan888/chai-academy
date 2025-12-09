import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
    const session = await getServerSession(authOptions)

    // Security Check: Only Admins
    if (!session || !session.user || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    try {
        const users = await prisma.user.findMany({
            where: { role: 'LEARNER' }, // fetching only learners for now
            include: {
                progress: true
            }
        })

        // Transform data for the dashboard
        const dashboardData = users.map((user: any) => {
            // Calculate progress percentage based on 6 lessons
            const completedCount = user.progress.filter((p: any) => p.completed).length
            const percentage = Math.round((completedCount / 6) * 100)

            return {
                id: user.id,
                name: user.name || 'Unknown',
                email: user.email,
                role: 'Staff', // Display name for LEARNER
                progress: percentage
            }
        })

        return NextResponse.json(dashboardData)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }
}
