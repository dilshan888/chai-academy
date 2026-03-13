import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/courses — list all published courses (phases) with progress
export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        const courses = await prisma.phase.findMany({
            where: { published: true },
            orderBy: { sortOrder: 'asc' },
            include: {
                modules: {
                    orderBy: { sortOrder: 'asc' },
                    include: {
                        lessons: {
                            orderBy: { sortOrder: 'asc' },
                            select: { id: true },
                        },
                    },
                },
            },
        })

        // If authenticated, get user progress
        let completedLessonIds: Set<string> = new Set()
        if (session?.user?.id) {
            const progress = await prisma.progress.findMany({
                where: { userId: session.user.id, completed: true },
                select: { lessonId: true },
            })
            completedLessonIds = new Set(progress.map(p => p.lessonId))
        }

        const result = courses.map(course => {
            const allLessonIds = course.modules.flatMap(m => m.lessons.map(l => l.id))
            const totalLessons = allLessonIds.length
            const completedLessons = allLessonIds.filter(id => completedLessonIds.has(id)).length

            return {
                id: course.id,
                title: course.title,
                slug: course.slug,
                description: course.description,
                imageUrl: course.imageUrl,
                duration: course.duration,
                xpReward: course.xpReward,
                sortOrder: course.sortOrder,
                moduleCount: course.modules.length,
                lessonCount: totalLessons,
                completedLessons,
                progress: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
            }
        })

        // Sort explicitly by sortOrder to ensure Phase 1 is first, Phase 2 is second, etc.
        result.sort((a, b) => a.sortOrder - b.sortOrder)

        return NextResponse.json(result)
    } catch (error) {
        console.error('Error fetching courses:', error)
        return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 })
    }
}
