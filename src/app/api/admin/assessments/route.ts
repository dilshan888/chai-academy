import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { assessmentQuestions } from '@/lib/assessment-data'

export async function GET() {
    const session = await getServerSession(authOptions)

    if (!session || !session.user || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    try {
        const responses = await prisma.assessmentResponse.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        department: true,
                    }
                }
            },
            orderBy: { submittedAt: 'desc' }
        })

        // Build a question lookup map for enriching answers
        const questionMap = new Map(assessmentQuestions.map(q => [q.id, q]))

        const enrichedResponses = responses.map(r => {
            const answers = (r.answers as { questionId: string; answer: string }[]).map(a => {
                const question = questionMap.get(a.questionId)
                
                let answerLabel = a.answer;
                if (question?.type === 'ORDERING') {
                    // For ordering, the answer is already the item labels separated by commas
                    // We can join them with arrows for better readability
                    answerLabel = a.answer.split(',').join(' → ');
                } else if (question?.options) {
                    answerLabel = question.options.find(o => o.value === a.answer)?.label || a.answer;
                }

                return {
                    questionId: a.questionId,
                    questionText: question?.text || 'Unknown Question',
                    category: question?.category || 'UNKNOWN',
                    answer: a.answer,
                    answerLabel: answerLabel,
                }
            })

            return {
                id: r.id,
                type: r.type,
                submittedAt: r.submittedAt,
                user: r.user,
                answers,
            }
        })

        // Summary stats
        const totalResponses = responses.length
        const preTestCount = responses.filter(r => r.type === 'PRE_TEST').length
        const postTestCount = responses.filter(r => r.type === 'POST_TEST').length
        const uniqueUsers = new Set(responses.map(r => r.userId)).size

        return NextResponse.json({
            responses: enrichedResponses,
            stats: {
                totalResponses,
                preTestCount,
                postTestCount,
                uniqueUsers,
            }
        })
    } catch (error) {
        console.error('Failed to fetch assessments:', error)
        return NextResponse.json({ error: 'Failed to fetch assessment data' }, { status: 500 })
    }
}
