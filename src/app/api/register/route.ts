import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
    try {
        const { name, email, password, gamificationOptIn, learningPace } = await req.json()

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
                role: 'LEARNER', // Default role
                learningPace: learningPace || 'beginner',
                optOutOfLeaderboard: gamificationOptIn !== undefined ? !gamificationOptIn : false,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true
            }
        })

        // 5. Initialize Gamification Record (if opted in)
        // If they explicitly opted IN (or it wasn't provided so we default to in), create the record
        if (gamificationOptIn === true || gamificationOptIn === undefined) {
            await prisma.userGamification.create({
                data: {
                    userId: user.id
                }
            })
        }

        return NextResponse.json({ message: 'User created successfully', user }, { status: 201 })

    } catch (error) {
        console.error("Registration error:", error)
        return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
    }
}
