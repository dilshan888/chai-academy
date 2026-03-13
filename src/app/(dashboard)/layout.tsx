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

        if (user && user.role !== 'ADMIN') {
            // Cutoff date: Only enforce assessments for users created after March 10, 2026
            const NEW_USER_CUTOFF = new Date('2026-03-10T00:00:00Z');
            const isNewUser = new Date(user.createdAt) >= NEW_USER_CUTOFF;

            if (isNewUser) {
                // 1. Check Pre-test
                if (!user.preTestCompleted) {
                    redirect('/assessment?type=pre')
                }

                // 2. Check Post-test (after completing 2+ modules)
                if (!user.postTestCompleted) {
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
    }

    return <DashboardLayout>{children}</DashboardLayout>
}
