import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GDPR Article 20 — Right to data portability
export async function GET() {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
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
                learningPace: true,
                weeklyEmailSummary: true,
                optOutOfLeaderboard: true,
                gdprConsentAt: true,
                privacyPolicyVersion: true,
                marketingConsent: true,
                createdAt: true,
                updatedAt: true,
                // Related data
                progress: {
                    select: {
                        lessonId: true,
                        completed: true,
                        score: true,
                        completedAt: true,
                        lesson: {
                            select: { title: true, slug: true }
                        }
                    }
                },
                gamification: {
                    select: {
                        totalXP: true,
                        level: true,
                        currentStreak: true,
                        longestStreak: true,
                        lastActivityDate: true,
                    }
                },
                achievements: {
                    select: {
                        unlockedAt: true,
                        achievement: {
                            select: { title: true, description: true, category: true }
                        }
                    }
                },
                streakHistory: {
                    select: { date: true }
                },
                xpHistory: {
                    select: {
                        amount: true,
                        reason: true,
                        createdAt: true,
                    }
                },
                scenarioResponses: {
                    select: {
                        chosenOption: true,
                        createdAt: true,
                        scenario: {
                            select: { title: true }
                        }
                    }
                },
                notifications: {
                    select: {
                        title: true,
                        message: true,
                        type: true,
                        read: true,
                        createdAt: true,
                    }
                },
            }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const exportData = {
            exportedAt: new Date().toISOString(),
            platform: 'ChAI Academy',
            gdprArticle: 'Article 20 — Right to data portability',
            userData: user,
        }

        return new NextResponse(JSON.stringify(exportData, null, 2), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="chai-academy-data-export-${new Date().toISOString().split('T')[0]}.json"`,
            },
        })
    } catch (error) {
        console.error('Data export failed:', error)
        return NextResponse.json({ error: 'Failed to export data' }, { status: 500 })
    }
}
