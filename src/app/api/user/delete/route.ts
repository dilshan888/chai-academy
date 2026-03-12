import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GDPR Article 17 — Right to erasure ("right to be forgotten")
export async function DELETE() {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        // Prevent admin self-deletion (safety measure)
        if (session.user.role === 'ADMIN') {
            return NextResponse.json(
                { error: 'Admin accounts cannot be self-deleted. Contact a system administrator.' },
                { status: 403 }
            )
        }

        // All relations have onDelete: Cascade, so deleting the user
        // automatically removes: Progress, UserGamification, UserAchievement,
        // StreakRecord, XPTransaction, ScenarioResponse, Notification
        await prisma.user.delete({
            where: { id: session.user.id }
        })

        return NextResponse.json({
            message: 'Account and all associated data have been permanently deleted.',
            gdprArticle: 'Article 17 — Right to erasure',
        })
    } catch (error) {
        console.error('Account deletion failed:', error)
        return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
    }
}
