import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET: Fetch notifications for current user (newest first)
export async function GET(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { searchParams } = new URL(req.url)
        const limit = parseInt(searchParams.get('limit') || '20', 10)
        const unreadOnly = searchParams.get('unread') === 'true'

        const where: { userId: string; read?: boolean } = { userId: session.user.id }
        if (unreadOnly) {
            where.read = false
        }

        const [notifications, unreadCount] = await Promise.all([
            prisma.notification.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                take: limit,
            }),
            prisma.notification.count({
                where: { userId: session.user.id, read: false },
            }),
        ])

        return NextResponse.json({ notifications, unreadCount })
    } catch (error) {
        console.error('Failed to fetch notifications', error)
        return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
    }
}

// PATCH: Mark notifications as read
export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { notificationIds, markAllRead } = await req.json()

        if (markAllRead) {
            // Mark all unread notifications as read for this user
            await prisma.notification.updateMany({
                where: { userId: session.user.id, read: false },
                data: { read: true },
            })
        } else if (notificationIds && Array.isArray(notificationIds)) {
            // Mark specific notifications as read (only if they belong to this user)
            await prisma.notification.updateMany({
                where: {
                    id: { in: notificationIds },
                    userId: session.user.id,
                },
                data: { read: true },
            })
        } else {
            return NextResponse.json({ error: 'Provide notificationIds or markAllRead' }, { status: 400 })
        }

        // Return updated unread count
        const unreadCount = await prisma.notification.count({
            where: { userId: session.user.id, read: false },
        })

        return NextResponse.json({ success: true, unreadCount })
    } catch (error) {
        console.error('Failed to update notifications', error)
        return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 })
    }
}
