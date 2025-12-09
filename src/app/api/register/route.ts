import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
    try {
        const { name, email, password } = await req.json()

        // 1. Validate Input
        if (!email || !password || !name) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        if (password.length < 6) {
            return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
        }

        // 2. Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 })
        }

        // 3. Hash Password
        const passwordHash = await bcrypt.hash(password, 10)

        // 4. Create User
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: passwordHash,
                role: 'LEARNER' // Default role
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true
            }
        })

        return NextResponse.json({ message: 'User created successfully', user }, { status: 201 })

    } catch (error) {
        console.error("Registration error:", error)
        return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
    }
}
