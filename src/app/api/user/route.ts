import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                department: true,
                jobTitle: true,
                avatarUrl: true,
                weeklyEmailSummary: true,
                learningPace: true,
                onboardingComplete: true,
                createdAt: true,
                gamification: true,
            },
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        return NextResponse.json({ user })
    } catch (error) {
        console.error("Fetch profile failed", error)
        return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
    }
}

export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { name, password, department, jobTitle, learningPace, weeklyEmailSummary, onboardingComplete } = body

        // Prepare update data
        const updateData: Record<string, unknown> = {}

        if (name && name.trim().length > 0) {
            updateData.name = name.trim()
        }

        if (password) {
            if (password.length < 6) {
                return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
            }
            updateData.password = await bcrypt.hash(password, 10)
        }

        if (department !== undefined) {
            updateData.department = department
        }

        if (jobTitle !== undefined) {
            updateData.jobTitle = jobTitle
        }

        if (learningPace !== undefined) {
            updateData.learningPace = learningPace
        }

        if (weeklyEmailSummary !== undefined) {
            updateData.weeklyEmailSummary = weeklyEmailSummary
        }

        if (onboardingComplete !== undefined) {
            updateData.onboardingComplete = onboardingComplete
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
        }

        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                department: true,
                jobTitle: true,
                learningPace: true,
                weeklyEmailSummary: true,
                onboardingComplete: true,
            },
        })

        return NextResponse.json({ message: 'Profile updated', user: updatedUser })

    } catch (error) {
        console.error("Update profile failed", error)
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }
}
