import nodemailer from 'nodemailer';
import { AssessmentType } from '@prisma/client';
import { AssessmentQuestion } from './assessment-data';

interface AssessmentSubmission {
    userId: string;
    userEmail?: string;
    type: AssessmentType;
    answers: { questionId: string; answer: string }[];
    questionsData: AssessmentQuestion[];
}

export async function sendAssessmentEmail(data: AssessmentSubmission) {
    const { userId, userEmail, type, answers, questionsData } = data;

    // Format the answers nicely
    const formattedAnswers = answers.map((ans) => {
        const question = questionsData.find(q => q.id === ans.questionId);
        let answerText = ans.answer;

        // Attempt to map choice values back to readable text for LITERACY questions
        if (question?.category === 'LITERACY' && question.options) {
            const option = question.options.find(o => o.value === ans.answer);
            if (option) {
                answerText = `[${ans.answer}] ${option.label}`;
            }
        }

        return `
    <strong>ID:</strong> ${ans.questionId}<br/>
    <strong>Question:</strong> ${question?.text || 'Unknown'}<br/>
    <strong>Answer:</strong> ${answerText}<br/>
    <hr/>
    `;
    }).join('\\n');

    const htmlContent = `
    <h2>New Research Assessment Submission</h2>
    <p><strong>Type:</strong> ${type}</p>
    <p><strong>User ID:</strong> ${userId}</p>
    <p><strong>User Email:</strong> ${userEmail || 'N/A'}</p>
    <h3>Responses:</h3>
    ${formattedAnswers}
  `;

    // Create transporter
    // We use process.env to pick up SMTP settings if configured.
    // If not configured, we can log it to console or throw a warning.
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    try {
        if (!process.env.SMTP_USER) {
            console.warn('⚠️ SMTP_USER not provided in environment. Email will not be sent, only logged.');
            console.log('--- MOCK EMAIL CONTENT ---');
            console.log(htmlContent.replace(/<[^>]+>/g, ''));
            return { success: true, mocked: true };
        }

        const info = await transporter.sendMail({
            from: '"ChAI Academy Assessments" <' + (process.env.SMTP_USER || 'noreply@chai.academy') + '>',
            to: 'brifalco@uni-bremen.de',
            subject: `[Research] ${type} Submission - User ${userId}`,
            html: htmlContent,
        });

        console.log('Message sent: %s', info.messageId);
        return { success: true };
    } catch (error) {
        console.error('Error sending assessment email:', error);
        // We do not want to fail the user's submission if email fails
        return { success: false, error };
    }
}
