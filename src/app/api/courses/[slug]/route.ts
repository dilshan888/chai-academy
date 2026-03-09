import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/courses/[slug] — get full course detail with modules, lessons, and user progress
export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params
        const session = await getServerSession(authOptions)

        const course = await prisma.phase.findUnique({
            where: { slug },
            include: {
                modules: {
                    orderBy: { sortOrder: 'asc' },
                    include: {
                        lessons: {
                            orderBy: { sortOrder: 'asc' },
                            select: {
                                id: true,
                                title: true,
                                slug: true,
                                description: true,
                                difficulty: true,
                                sortOrder: true,
                                scenario: {
                                    select: { id: true },
                                },
                            },
                        },
                    },
                },
            },
        })

        if (!course) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 })
        }

        // Get user progress if authenticated
        let completedLessonIds: Set<string> = new Set()
        if (session?.user?.id) {
            const progress = await prisma.progress.findMany({
                where: { userId: session.user.id, completed: true },
                select: { lessonId: true },
            })
            completedLessonIds = new Set(progress.map(p => p.lessonId))
        }

        // Build response with progress
        const allLessonIds = course.modules.flatMap(m => m.lessons.map(l => l.id))
        const totalLessons = allLessonIds.length
        const completedCount = allLessonIds.filter(id => completedLessonIds.has(id)).length

        const modules = course.modules.map(mod => {
            const moduleLessonIds = mod.lessons.map(l => l.id)
            const moduleCompleted = moduleLessonIds.filter(id => completedLessonIds.has(id)).length

            return {
                id: mod.id,
                title: mod.title,
                slug: mod.slug,
                description: mod.description,
                sortOrder: mod.sortOrder,
                lessonCount: mod.lessons.length,
                completedLessons: moduleCompleted,
                progress: mod.lessons.length > 0 ? Math.round((moduleCompleted / mod.lessons.length) * 100) : 0,
                lessons: mod.lessons.map(lesson => ({
                    ...lesson,
                    completed: completedLessonIds.has(lesson.id),
                    hasScenario: !!lesson.scenario,
                })),
            }
        })

        return NextResponse.json({
            id: course.id,
            title: course.title,
            slug: course.slug,
            description: course.description,
            imageUrl: course.imageUrl,
            duration: course.duration,
            xpReward: course.xpReward,
            moduleCount: course.modules.length,
            lessonCount: totalLessons,
            completedLessons: completedCount,
            progress: totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0,
            modules,
        })
    } catch (error) {
        console.error('Error fetching course:', error)
        return NextResponse.json({ error: 'Failed to fetch course' }, { status: 500 })
    }
}
