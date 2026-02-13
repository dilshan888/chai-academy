import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

const SCENARIOS = [
    {
        lessonId: 1,
        title: 'The Smart Calendar',
        riskLevel: 'MINIMAL',
        situation: 'You manage scheduling for a busy faculty office. Your university recently adopted a "Smart Calendar" tool that analyzes staff members\' past meeting patterns, email response times, and calendar availability to automatically suggest optimal meeting slots.\n\nThe tool has been incredibly efficient — cutting scheduling time by 70%. However, you notice it consistently avoids scheduling meetings before 10am for one particular professor, even though their calendar shows availability from 8am.',
        prompt: 'How should you handle this AI scheduling behaviour?',
        options: [
            {
                id: 'A',
                label: 'Trust the AI',
                description: 'The AI clearly knows best — it has analyzed patterns you cannot see. Continue using its suggestions without questioning.',
                impacts: { compliance: 30, ethics: 20, trust: 40 },
                feedback: 'While the AI may have useful data, blindly trusting it removes the human oversight that the EU AI Act emphasizes. The AI might be reinforcing a bias rather than reflecting a genuine preference.',
                isOptimal: false,
            },
            {
                id: 'B',
                label: 'Investigate and override if needed',
                description: 'Check with the professor about their actual preferences. If the AI\'s pattern doesn\'t match their wishes, manually adjust the settings.',
                impacts: { compliance: 90, ethics: 95, trust: 90 },
                feedback: 'Excellent! This is the "Human in the Loop" approach. You verified the AI\'s behaviour against real preferences and maintained oversight. The professor may indeed prefer later meetings — or the AI may have learned from outdated data.',
                isOptimal: true,
            },
            {
                id: 'C',
                label: 'Disable the AI tool entirely',
                description: 'The AI is making decisions it shouldn\'t. Remove it and go back to manual scheduling.',
                impacts: { compliance: 60, ethics: 50, trust: 30 },
                feedback: 'While caution is good, completely removing a useful tool isn\'t proportionate. The EU AI Act doesn\'t ban minimal-risk AI — it encourages responsible use with appropriate oversight.',
                isOptimal: false,
            },
        ],
        proTip: 'Under the EU AI Act, minimal-risk AI systems like scheduling tools don\'t require strict regulation, but they still benefit from human oversight. Always verify AI suggestions against real-world context.',
        xpReward: 30,
        sortOrder: 1,
    },
    {
        lessonId: 2,
        title: 'The Admissions Inbox',
        riskLevel: 'HIGH',
        situation: 'It\'s peak admissions season and your university receives over 5,000 applications. The admissions office has deployed an AI system that automatically scans application essays and flags applicants as "High Potential", "Standard", or "Review Required" based on keyword analysis.\n\nYou notice that the system is flagging significantly fewer applicants from non-English-speaking backgrounds as "High Potential", even when their qualifications are strong. A colleague dismisses it: "The AI just looks at language quality — it\'s objective."',
        prompt: 'What is the right course of action?',
        options: [
            {
                id: 'A',
                label: 'Accept the AI\'s classifications',
                description: 'Language quality is a valid criterion. The AI is being objective and consistent — something humans struggle with at this volume.',
                impacts: { compliance: 10, ethics: 10, trust: 15 },
                feedback: 'This approach risks systematic discrimination. The EU AI Act classifies AI in education as HIGH RISK precisely because it can affect life chances. Language quality ≠ academic potential, and this bias could violate equality legislation.',
                isOptimal: false,
            },
            {
                id: 'B',
                label: 'Flag the bias and request an audit',
                description: 'Report the pattern to management. Request a formal bias audit of the AI system and ensure human reviewers check all "Standard" and "Review Required" applications.',
                impacts: { compliance: 95, ethics: 95, trust: 90 },
                feedback: 'Perfect response. The EU AI Act requires high-risk AI systems to undergo bias testing and maintain human oversight. By flagging this, you\'re ensuring the university meets its legal obligations and treats all applicants fairly.',
                isOptimal: true,
            },
            {
                id: 'C',
                label: 'Manually review flagged applications yourself',
                description: 'Quietly review the applications yourself to correct any mistakes, without formally reporting the issue.',
                impacts: { compliance: 40, ethics: 60, trust: 50 },
                feedback: 'While your intentions are good, this doesn\'t fix the systemic issue. The AI will continue to be biased for future applicants. The EU AI Act requires documented oversight processes — informal fixes aren\'t sufficient for high-risk systems.',
                isOptimal: false,
            },
        ],
        proTip: 'AI in education is classified as HIGH RISK under the EU AI Act because it can determine access to education. Any AI system that screens applicants must undergo regular bias audits and maintain robust human oversight.',
        xpReward: 30,
        sortOrder: 2,
    },
    {
        lessonId: 3,
        title: 'The Meeting Minutes',
        riskLevel: 'LIMITED',
        situation: 'You\'ve just finished a two-hour confidential faculty meeting discussing student disciplinary cases, staff performance reviews, and budget allocations. Your manager asks you to produce detailed minutes by tomorrow morning.\n\nA colleague recommends a free online AI transcription tool: "Just upload the recording — it\'ll save you hours!" The tool\'s website mentions it\'s hosted on US servers and uses data to "improve AI models."',
        prompt: 'What should you do with the meeting recording?',
        options: [
            {
                id: 'A',
                label: 'Upload to the free AI tool',
                description: 'It\'s just a transcription — the recording will be deleted after processing. The time saved is worth it.',
                impacts: { compliance: 5, ethics: 10, trust: 10 },
                feedback: 'This is a serious GDPR violation. The recording contains personal data about students and staff. Uploading it to a US-hosted service that uses data for model training means the university has lost control of sensitive personal data.',
                isOptimal: false,
            },
            {
                id: 'B',
                label: 'Use a university-approved secure tool',
                description: 'Check if the university has a licensed, GDPR-compliant transcription service. If not, transcribe it manually.',
                impacts: { compliance: 95, ethics: 90, trust: 95 },
                feedback: 'Excellent choice. Using approved tools ensures data stays within GDPR-compliant infrastructure. If no approved tool exists, manual transcription protects the data. You could also raise the need for an approved tool with IT.',
                isOptimal: true,
            },
            {
                id: 'C',
                label: 'Remove names first, then upload',
                description: 'Edit the audio to bleep out names before uploading, so no personal data is shared.',
                impacts: { compliance: 35, ethics: 45, trust: 40 },
                feedback: 'While anonymisation is a valid technique, it\'s extremely difficult with audio — context clues can still identify individuals. The discussion topics themselves (disciplinary cases, specific performance issues) may be identifiable. This approach creates a false sense of security.',
                isOptimal: false,
            },
        ],
        proTip: 'Under GDPR, personal data includes anything that can identify a person — directly or indirectly. Meeting discussions about specific cases are personal data even without names. Always use university-approved tools for sensitive content.',
        xpReward: 30,
        sortOrder: 3,
    },
    {
        lessonId: 4,
        title: 'Chatbot Disclosure',
        riskLevel: 'LIMITED',
        situation: 'Your university has just launched "UniBot", an AI-powered chatbot on the student services website. It handles common queries about enrollment, fees, deadlines, and accommodation.\n\nThe chatbot is performing well — resolving 80% of queries without human intervention. However, you receive a complaint from a student: "I chatted for 20 minutes thinking I was talking to Sarah from Student Services. When I found out it was a bot, I felt deceived. I shared personal financial information."',
        prompt: 'How should the university respond to this complaint?',
        options: [
            {
                id: 'A',
                label: 'Dismiss the complaint',
                description: 'The chatbot provided accurate information. The student got their answer — it doesn\'t matter who (or what) provided it.',
                impacts: { compliance: 10, ethics: 15, trust: 10 },
                feedback: 'The EU AI Act requires transparency for AI systems that interact with people. Users must be informed they are interacting with AI. Dismissing this complaint ignores a legal requirement and damages student trust.',
                isOptimal: false,
            },
            {
                id: 'B',
                label: 'Add clear AI disclosure and review data handling',
                description: 'Update UniBot to clearly state "I am an AI assistant" at the start of every conversation. Review what personal data was collected and ensure it\'s handled appropriately.',
                impacts: { compliance: 95, ethics: 90, trust: 95 },
                feedback: 'This is the correct approach under the EU AI Act\'s transparency obligations. Limited-risk AI systems like chatbots MUST disclose their AI nature. Additionally, reviewing data handling protects the student\'s personal information.',
                isOptimal: true,
            },
            {
                id: 'C',
                label: 'Rename the bot to something obviously artificial',
                description: 'Change the name from "Sarah" to "UniBot" — that should make it obvious it\'s not a real person.',
                impacts: { compliance: 50, ethics: 55, trust: 60 },
                feedback: 'Renaming helps, but it\'s not sufficient. The EU AI Act requires explicit disclosure that the user is interacting with AI — not just an "obvious" name. Some users may not realize "UniBot" means AI. Clear, upfront disclosure is legally required.',
                isOptimal: false,
            },
        ],
        proTip: 'The EU AI Act\'s transparency requirements for "limited risk" AI include chatbots and virtual assistants. They must clearly inform users they are interacting with an AI system — ideally at the very start of the interaction.',
        xpReward: 30,
        sortOrder: 4,
    },
    {
        lessonId: 5,
        title: 'The CV Sorter',
        riskLevel: 'HIGH',
        situation: 'The HR department has purchased an AI-powered recruitment tool called "TalentMatch" to help screen the 2,000+ CVs received for administrative positions. The tool scores candidates based on keywords, experience patterns, and "culture fit" metrics.\n\nAfter the first batch, you notice that the tool has automatically rejected 85% of candidates over age 50 and candidates with career gaps (often women who took maternity leave). The vendor says this is because "the training data reflects successful hires from the past five years."',
        prompt: 'What action should be taken regarding TalentMatch?',
        options: [
            {
                id: 'A',
                label: 'Continue using it with minor adjustments',
                description: 'Ask the vendor to "tune down" the age and gap weighting slightly, but keep using the tool — it saves enormous time.',
                impacts: { compliance: 20, ethics: 25, trust: 25 },
                feedback: 'Minor adjustments don\'t fix fundamental bias. If the training data is discriminatory, the outputs will be too. Under the EU AI Act, high-risk AI in employment requires thorough bias mitigation — not just parameter tweaking.',
                isOptimal: false,
            },
            {
                id: 'B',
                label: 'Suspend the tool and demand a full audit',
                description: 'Immediately stop using TalentMatch for decisions. Demand a bias audit from the vendor, involve the equality office, and ensure all auto-rejected candidates are manually reviewed.',
                impacts: { compliance: 95, ethics: 95, trust: 90 },
                feedback: 'The correct response. The EU AI Act requires high-risk AI in employment to have robust bias testing, human oversight, and documented risk management. Suspending the tool while investigating protects both candidates and the university.',
                isOptimal: true,
            },
            {
                id: 'C',
                label: 'Use the AI scores as just one factor',
                description: 'Don\'t auto-reject anyone. Instead, use the AI scores alongside human review for all candidates.',
                impacts: { compliance: 60, ethics: 65, trust: 65 },
                feedback: 'Using AI scores as one factor is better than auto-rejecting, but the scores themselves are biased. Including biased data "as one factor" still systematically disadvantages certain groups. The root cause — discriminatory training data — must be addressed first.',
                isOptimal: false,
            },
        ],
        proTip: 'AI in employment and recruitment is classified as HIGH RISK under the EU AI Act. These systems must demonstrate fairness, undergo bias testing, maintain logs of decisions, and always include meaningful human oversight.',
        xpReward: 30,
        sortOrder: 5,
    },
    {
        lessonId: 6,
        title: 'The Grade Dispute',
        riskLevel: 'HIGH',
        situation: 'Your university has piloted an AI grading assistant for a large first-year module with 500 students. The AI grades essay submissions based on rubric criteria, comparing them against thousands of past graded essays.\n\nA student, Maya, receives a failing grade on her essay. She appeals, saying she followed all the rubric criteria. When you investigate, you find the AI downgraded her essay because it used an unconventional argument structure — valid and well-supported, but different from the patterns in the training data.',
        prompt: 'As the administrator handling this appeal, what should you do?',
        options: [
            {
                id: 'A',
                label: 'Uphold the AI grade',
                description: 'The AI was trained on thousands of essays. Its grading is more consistent than any human marker. Maya\'s argument style simply didn\'t meet the standard.',
                impacts: { compliance: 10, ethics: 10, trust: 10 },
                feedback: 'This violates the "Human in the Loop" principle. The EU AI Act requires human oversight for high-risk AI decisions — especially in education. An AI that penalizes valid but unconventional thinking is failing at its purpose.',
                isOptimal: false,
            },
            {
                id: 'B',
                label: 'Have a qualified human re-grade the essay',
                description: 'Assign the essay to an academic for independent grading. Review whether the AI\'s rubric interpretation is too narrow and flag the issue for the module team.',
                impacts: { compliance: 95, ethics: 95, trust: 95 },
                feedback: 'This is the model response. Human oversight means a qualified person can override AI decisions. The EU AI Act specifically requires this for high-risk systems in education. You\'ve also flagged a systemic issue that could affect other students.',
                isOptimal: true,
            },
            {
                id: 'C',
                label: 'Give Maya a pass to resolve the complaint',
                description: 'Change her grade to a pass to make the complaint go away, without investigating the AI\'s behaviour further.',
                impacts: { compliance: 30, ethics: 35, trust: 40 },
                feedback: 'While this helps Maya, it doesn\'t address the root cause. Other students with unconventional (but valid) approaches may also have been unfairly graded. The AI system needs review, not just a one-off grade change.',
                isOptimal: false,
            },
        ],
        proTip: 'The EU AI Act\'s "Human in the Loop" requirement means AI cannot be the sole decision-maker for consequential outcomes like grades. A qualified human must be able to understand, review, and override AI decisions.',
        xpReward: 30,
        sortOrder: 6,
    },
]

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

        // 5. Seed Lesson records (required for Progress foreign key)
        const LESSON_SEEDS = [
            { id: '1', title: 'What AI Is (and Is Not)', slug: 'what-ai-is', difficulty: 'beginner' },
            { id: '2', title: 'Where AI Appears in University Administration', slug: 'ai-in-admin', difficulty: 'beginner' },
            { id: '3', title: 'Data, Privacy, and GDPR Basics', slug: 'data-privacy-gdpr', difficulty: 'beginner' },
            { id: '4', title: 'EU AI Act Overview for Admin Work', slug: 'eu-ai-act-overview', difficulty: 'intermediate' },
            { id: '5', title: 'High Risk vs Low Risk AI Systems', slug: 'high-vs-low-risk', difficulty: 'intermediate' },
            { id: '6', title: 'Human Oversight and Responsibility', slug: 'human-oversight', difficulty: 'intermediate' },
        ]

        for (const lesson of LESSON_SEEDS) {
            await prisma.lesson.upsert({
                where: { slug: lesson.slug },
                update: { id: lesson.id, title: lesson.title },
                create: lesson,
            })
        }

        // 6. Seed Scenarios
        for (const scenario of SCENARIOS) {
            await prisma.scenario.upsert({
                where: { lessonId: scenario.lessonId },
                update: {},
                create: scenario,
            })
        }

        return NextResponse.json({
            message: 'Database seeded successfully',
            users: [admin.email, learner.email],
            achievements: ACHIEVEMENTS.length,
            scenarios: SCENARIOS.length,
            lessons: LESSON_SEEDS.length,
        })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to seed database', details: error }, { status: 500 })
    }
}
