import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export default async function Layout({ children }: { children: React.ReactNode }) {
    const session = await getServerSession(authOptions)

    if (session?.user?.email) {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { progress: true }
        })

        if (user) {
            // 1. Check Pre-test
            if (!user.preTestCompleted) {
                redirect('/assessment?type=pre')
            }

            // 2. Check Post-test
            if (!user.postTestCompleted) {
                // Count completed modules. Progress tracks 'lessonId', but for a simple check:
                // Let's count lessons completed to infer "two modules". Or better, query modules where all lessons are complete.
                // The prompt says "after the user finishes any two module". Let's check the distinct modules of completed lessons.
                const progressRecords = await prisma.progress.findMany({
                    where: { userId: user.id, completed: true },
                    include: { lesson: true }
                })

                const completedModuleIds = new Set(progressRecords.map(p => p.lesson.moduleId).filter(Boolean))

                if (completedModuleIds.size >= 2) {
                    redirect('/assessment?type=post')
                }
            }
        }
    }

    return <DashboardLayout>{children}</DashboardLayout>
}
