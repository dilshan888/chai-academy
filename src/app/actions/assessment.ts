'use server';

import { prisma } from '@/lib/prisma';
import { AssessmentType } from '@prisma/client';
import { sendAssessmentEmail } from '@/lib/email';
import { assessmentQuestions } from '@/lib/assessment-data';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function submitAssessmentAction(type: AssessmentType, answers: { questionId: string; answer: string }[]) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            throw new Error('Not authenticated');
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            throw new Error('User not found');
        }

        // 1. Save response to database
        await prisma.assessmentResponse.create({
            data: {
                userId: user.id,
                type: type,
                answers: answers
            }
        });

        // 2. Update user status to prevent re-taking
        if (type === 'PRE_TEST') {
            await prisma.user.update({
                where: { id: user.id },
                data: { preTestCompleted: true }
            });
        } else if (type === 'POST_TEST') {
            await prisma.user.update({
                where: { id: user.id },
                data: { postTestCompleted: true }
            });
        }

        // 3. Send Email to Researcher asynchronously (don't block the UI response)
        sendAssessmentEmail({
            userId: user.id,
            userEmail: user.email || undefined,
            type: type,
            answers: answers,
            questionsData: assessmentQuestions
        }).catch(e => console.error("Background email failure:", e));

        revalidatePath('/dashboard');
        return { success: true };

    } catch (error) {
        console.error('Failed to submit assessment:', error);
        return { success: false, error: 'Failed to submit the assessment.' };
    }
}
