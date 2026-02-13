import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

const ACHIEVEMENTS = [
    {
        slug: 'first-lesson',
        title: 'First Steps',
        description: 'Complete your first lesson',
        iconEmoji: '👣',
        category: 'learning',
        xpReward: 25,
        criteria: { type: 'lessons_completed', count: 1 },
        sortOrder: 1,
    },
    {
        slug: 'three-lessons',
        title: 'Getting Started',
        description: 'Complete 3 lessons',
        iconEmoji: '📚',
        category: 'learning',
        xpReward: 50,
        criteria: { type: 'lessons_completed', count: 3 },
        sortOrder: 2,
    },
    {
        slug: 'all-lessons',
        title: 'Course Complete',
        description: 'Complete all lessons in a course',
        iconEmoji: '🎓',
        category: 'mastery',
        xpReward: 200,
        criteria: { type: 'lessons_completed', count: 6 },
        sortOrder: 3,
    },
    {
        slug: 'perfect-quiz',
        title: 'Sharp Mind',
        description: 'Get a perfect score on a quiz',
        iconEmoji: '🧠',
        category: 'mastery',
        xpReward: 75,
        criteria: { type: 'quiz_perfect_score', count: 1 },
        sortOrder: 4,
    },
    {
        slug: 'streak-3',
        title: 'On Fire',
        description: 'Maintain a 3-day learning streak',
        iconEmoji: '🔥',
        category: 'engagement',
        xpReward: 50,
        criteria: { type: 'streak_days', count: 3 },
        sortOrder: 5,
    },
    {
        slug: 'streak-7',
        title: 'Unstoppable',
        description: 'Maintain a 7-day learning streak',
        iconEmoji: '⚡',
        category: 'engagement',
        xpReward: 100,
        criteria: { type: 'streak_days', count: 7 },
        sortOrder: 6,
    },
    {
        slug: 'streak-30',
        title: 'Dedication',
        description: 'Maintain a 30-day learning streak',
        iconEmoji: '💎',
        category: 'engagement',
        xpReward: 300,
        criteria: { type: 'streak_days', count: 30 },
        sortOrder: 7,
    },
    {
        slug: 'early-bird',
        title: 'Early Bird',
        description: 'Among the first to join ChAI Academy',
        iconEmoji: '🐦',
        category: 'engagement',
        xpReward: 25,
        criteria: { type: 'registered_early', count: 1 },
        sortOrder: 8,
    },
]

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

        // 3. Seed Achievements
        for (const achievement of ACHIEVEMENTS) {
            await prisma.achievement.upsert({
                where: { slug: achievement.slug },
                update: {},
                create: achievement,
            })
        }

        // 4. Create gamification records for existing users (if they don't have one)
        const allUsers = await prisma.user.findMany({ select: { id: true } })
        for (const user of allUsers) {
            await prisma.userGamification.upsert({
                where: { userId: user.id },
                update: {},
                create: { userId: user.id },
            })
        }

        return NextResponse.json({
            message: 'Database seeded successfully',
            users: [admin.email, learner.email],
            achievements: ACHIEVEMENTS.length,
        })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to seed database', details: error }, { status: 500 })
    }
}
