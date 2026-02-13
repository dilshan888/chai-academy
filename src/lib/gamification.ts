import { prisma } from '@/lib/prisma'

// === Level Thresholds ===
const LEVEL_THRESHOLDS = [
    { level: 1, xp: 0, title: 'Novice' },
    { level: 2, xp: 100, title: 'Apprentice' },
    { level: 3, xp: 300, title: 'Practitioner' },
    { level: 4, xp: 600, title: 'Specialist' },
    { level: 5, xp: 1000, title: 'Expert' },
    { level: 6, xp: 1500, title: 'Master' },
    { level: 7, xp: 2500, title: 'Champion' },
]

// === XP Award Amounts ===
export const XP_AMOUNTS = {
    LESSON_SECTION: 15,
    QUIZ_CORRECT: 25,
    LESSON_COMPLETE: 50,
    BADGE_EARNED: 0, // varies per badge
} as const

// === Streak Config ===
const STREAK_MULTIPLIER_INCREMENT = 0.1
const STREAK_MULTIPLIER_CAP = 2.0

export function calculateLevel(totalXP: number): number {
    let level = 1
    for (const threshold of LEVEL_THRESHOLDS) {
        if (totalXP >= threshold.xp) {
            level = threshold.level
        }
    }
    return level
}

export function getLevelTitle(level: number): string {
    const entry = LEVEL_THRESHOLDS.find((t) => t.level === level)
    return entry?.title ?? 'Novice'
}

export function getNextLevelXP(level: number): number | null {
    const next = LEVEL_THRESHOLDS.find((t) => t.level === level + 1)
    return next?.xp ?? null
}

export async function ensureGamificationRecord(userId: string) {
    return prisma.userGamification.upsert({
        where: { userId },
        update: {},
        create: { userId },
    })
}

export async function awardXP(
    userId: string,
    amount: number,
    reason: string,
    sourceId?: string
): Promise<{ xpGained: number; totalXP: number; level: number; levelTitle: string; leveledUp: boolean }> {
    await ensureGamificationRecord(userId)

    // Get current streak multiplier
    const gamification = await prisma.userGamification.findUnique({
        where: { userId },
    })

    const multiplier = gamification?.streakMultiplier ?? 1.0
    const adjustedAmount = Math.round(amount * multiplier)

    // Create XP transaction
    await prisma.xPTransaction.create({
        data: {
            userId,
            amount: adjustedAmount,
            reason,
            sourceId,
        },
    })

    // Update total XP
    const updated = await prisma.userGamification.update({
        where: { userId },
        data: {
            totalXP: { increment: adjustedAmount },
        },
    })

    const newLevel = calculateLevel(updated.totalXP)
    const oldLevel = gamification?.level ?? 1
    const leveledUp = newLevel > oldLevel

    // Update level if changed
    if (leveledUp) {
        await prisma.userGamification.update({
            where: { userId },
            data: { level: newLevel },
        })
    }

    return {
        xpGained: adjustedAmount,
        totalXP: updated.totalXP,
        level: newLevel,
        levelTitle: getLevelTitle(newLevel),
        leveledUp,
    }
}

export async function updateStreak(
    userId: string
): Promise<{ currentStreak: number; multiplier: number }> {
    await ensureGamificationRecord(userId)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Record today's activity (upsert to avoid duplicates)
    await prisma.streakRecord.upsert({
        where: {
            userId_date: { userId, date: today },
        },
        update: {},
        create: { userId, date: today },
    })

    // Calculate current streak by counting consecutive days backwards from today
    const records = await prisma.streakRecord.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        take: 365, // max lookback
    })

    let streak = 0
    const checkDate = new Date(today)

    for (const record of records) {
        const recordDate = new Date(record.date)
        recordDate.setHours(0, 0, 0, 0)

        if (recordDate.getTime() === checkDate.getTime()) {
            streak++
            checkDate.setDate(checkDate.getDate() - 1)
        } else {
            break
        }
    }

    const multiplier = Math.min(
        1.0 + (streak - 1) * STREAK_MULTIPLIER_INCREMENT,
        STREAK_MULTIPLIER_CAP
    )
    const clampedMultiplier = Math.max(1.0, multiplier)

    // Update gamification record
    const current = await prisma.userGamification.findUnique({
        where: { userId },
    })

    await prisma.userGamification.update({
        where: { userId },
        data: {
            currentStreak: streak,
            longestStreak: Math.max(streak, current?.longestStreak ?? 0),
            lastActivityDate: new Date(),
            streakMultiplier: clampedMultiplier,
        },
    })

    return { currentStreak: streak, multiplier: clampedMultiplier }
}

export async function checkAndAwardBadges(
    userId: string
): Promise<Array<{ slug: string; title: string; iconEmoji: string; xpReward: number }>> {
    const newBadges: Array<{ slug: string; title: string; iconEmoji: string; xpReward: number }> = []

    // Get all achievements the user hasn't earned yet
    const allAchievements = await prisma.achievement.findMany({
        orderBy: { sortOrder: 'asc' },
    })

    const earned = await prisma.userAchievement.findMany({
        where: { userId },
        select: { achievementId: true },
    })
    const earnedIds = new Set(earned.map((e) => e.achievementId))

    const unearnedAchievements = allAchievements.filter((a) => !earnedIds.has(a.id))

    // Get user stats for checking criteria
    const completedLessonsCount = await prisma.progress.count({
        where: { userId, completed: true },
    })

    const gamification = await prisma.userGamification.findUnique({
        where: { userId },
    })

    const perfectScores = await prisma.progress.count({
        where: { userId, completed: true, score: 100 },
    })

    for (const achievement of unearnedAchievements) {
        const criteria = achievement.criteria as { type: string; count: number }
        let earned = false

        switch (criteria.type) {
            case 'lessons_completed':
                earned = completedLessonsCount >= criteria.count
                break
            case 'streak_days':
                earned = (gamification?.currentStreak ?? 0) >= criteria.count
                break
            case 'quiz_perfect_score':
                earned = perfectScores >= criteria.count
                break
            case 'registered_early':
                // Award to all existing users during seeding
                earned = true
                break
        }

        if (earned) {
            await prisma.userAchievement.create({
                data: { userId, achievementId: achievement.id },
            })

            // Award badge XP (without multiplier - use raw amount)
            if (achievement.xpReward > 0) {
                await prisma.xPTransaction.create({
                    data: {
                        userId,
                        amount: achievement.xpReward,
                        reason: 'badge_earned',
                        sourceId: achievement.id,
                    },
                })
                await prisma.userGamification.update({
                    where: { userId },
                    data: {
                        totalXP: { increment: achievement.xpReward },
                    },
                })
            }

            newBadges.push({
                slug: achievement.slug,
                title: achievement.title,
                iconEmoji: achievement.iconEmoji,
                xpReward: achievement.xpReward,
            })
        }
    }

    // Recalculate level after badge XP
    if (newBadges.length > 0) {
        const updated = await prisma.userGamification.findUnique({
            where: { userId },
        })
        if (updated) {
            const newLevel = calculateLevel(updated.totalXP)
            if (newLevel !== updated.level) {
                await prisma.userGamification.update({
                    where: { userId },
                    data: { level: newLevel },
                })
            }
        }
    }

    return newBadges
}

export async function getUserStats(userId: string) {
    await ensureGamificationRecord(userId)

    const gamification = await prisma.userGamification.findUnique({
        where: { userId },
    })

    // Get today's XP
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todayTransactions = await prisma.xPTransaction.findMany({
        where: {
            userId,
            createdAt: { gte: today, lt: tomorrow },
        },
    })
    const todayXP = todayTransactions.reduce((sum, t) => sum + t.amount, 0)

    // Get recent transactions
    const recentTransactions = await prisma.xPTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
    })

    // Get badge count
    const badgeCount = await prisma.userAchievement.count({
        where: { userId },
    })

    const totalXP = gamification?.totalXP ?? 0
    const level = gamification?.level ?? 1
    const nextLevelXP = getNextLevelXP(level)

    return {
        totalXP,
        level,
        levelTitle: getLevelTitle(level),
        nextLevelXP,
        currentStreak: gamification?.currentStreak ?? 0,
        longestStreak: gamification?.longestStreak ?? 0,
        streakMultiplier: gamification?.streakMultiplier ?? 1.0,
        lastActivityDate: gamification?.lastActivityDate,
        todayXP,
        badgeCount,
        recentTransactions: recentTransactions.map((t) => ({
            amount: t.amount,
            reason: t.reason,
            createdAt: t.createdAt,
        })),
    }
}
