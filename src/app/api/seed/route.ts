import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
    try {
        // Hash passwords
        const passwordHash = await bcrypt.hash('chai-academy', 10)

        // 1. Upsert Admin User
        const admin = await prisma.user.upsert({
            where: { email: 'admin@uni.edu' },
            update: {},
            create: {
                email: 'admin@uni.edu',
                name: 'System Admin',
                password: passwordHash,
                role: 'ADMIN',
            },
        })

        // 2. Upsert Learner User
        const learner = await prisma.user.upsert({
            where: { email: 'staff@uni.edu' },
            update: {},
            create: {
                email: 'staff@uni.edu',
                name: 'Jane Staff',
                password: passwordHash,
                role: 'LEARNER',
            },
        })

        return NextResponse.json({
            message: 'Database seeded successfully',
            users: [admin.email, learner.email]
        })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to seed database', details: error }, { status: 500 })
    }
}
