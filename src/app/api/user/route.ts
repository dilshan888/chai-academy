import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { name, password } = body

        // Prepare update data
        const updateData: any = {}

        if (name && name.trim().length > 0) {
            updateData.name = name.trim()
        }

        if (password) {
            if (password.length < 6) {
                return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
            }
            updateData.password = await bcrypt.hash(password, 10)
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
        }

        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: updateData,
            select: { id: true, name: true, email: true } // Don't return password
        })

        return NextResponse.json({ message: 'Profile updated', user: updatedUser })

    } catch (error) {
        console.error("Update profile failed", error)
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }
}
