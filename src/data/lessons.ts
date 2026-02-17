export interface Section {
    type: 'knowledge' | 'context' | 'skill' | 'disposition'
    title: string
    content?: string
    question?: string
    options?: string[]
    correctIndex?: number
    explanation?: string
    sourceUrl?: string
    sourceLabel?: string
}

export interface Lesson {
    id: number
    title: string
    sections: Section[]
}

export const LESSONS: Record<string, Lesson> = {
    "1": {
        id: 1,
        title: "What AI Is (and Is Not)",
        sections: [
            {
                type: 'knowledge',
                title: 'Defining AI for Admins',
                content: "Artificial Intelligence isn't magic. It's simply a system that identifies patterns in data to make predictions or decisions. It includes 'Machine Learning' (learning from data) and 'Generative AI' (creating new text/images).",
                sourceUrl: 'https://digital-strategy.ec.europa.eu/en/policies/european-approach-artificial-intelligence',
                sourceLabel: 'European Commission — AI Strategy'
            },
            {
                type: 'context',
                title: 'Scenario: The "Smart" Calendar',
                content: "You use a scheduling tool that suggests the best meeting times. It doesn't 'know' your preferences; it just calculates probability based on your past accepted invites."
            },
            {
                type: 'skill',
                title: 'Spot the AI',
                question: "Which of these is NOT an example of AI?",
                options: [
                    "ChatGPT writing an email draft",
                    "A static Excel formula (=SUM)",
                    "FaceID unlocking your phone"
                ],
                correctIndex: 1
            },
            {
                type: 'disposition',
                title: 'Reflection',
                content: "AI is a tool, not a colleague. It can calculate faster than you, but it cannot understand context, empathy, or university policy nuances."
            }
        ]
    },
    "2": {
        id: 2,
        title: "Where AI Appears in University Administration",
        sections: [
            {
                type: 'knowledge',
                title: 'Knowledge',
                content: "AI isn't just robots. In university admin, it appears in: Email filtering (spam), Predictive text (Gmail), Translation tools (DeepL), Recruitment screening tools."
            },
            {
                type: 'context',
                title: 'Context: The Admissions Inbox',
                content: "Imagine you are an admissions officer. You receive 5,000 emails a week during peak season. You use a tool that automatically tags emails as 'Urgent', 'Standard', or 'SPAM'. This tool is AI."
            },
            {
                type: 'skill',
                title: 'Skill: Identify the AI',
                question: "Which of these is likely using AI?",
                options: [
                    "A spreadsheet calculating the sum of student fees",
                    "A system flagging 'high potential' applicants based on essay keywords",
                    "An email merge sending bulk acceptances"
                ],
                correctIndex: 1
            },
            {
                type: 'disposition',
                title: 'Reflection',
                content: "If the AI system flags an applicant as 'Low Potential', should you trust it blindly? What if the AI is biased against certain keywords? Your responsibility is oversight."
            }
        ]
    },
    "3": {
        id: 3,
        title: "Data, Privacy, and GDPR Basics",
        sections: [
            {
                type: 'knowledge',
                title: 'Data is Fuel',
                content: "AI needs data to learn. If you put student data (names, grades, medical info) into a public AI tool (like free ChatGPT), that data leaves the university. This is a GDPR violation.",
                sourceUrl: 'https://gdpr-info.eu/',
                sourceLabel: 'GDPR Full Text — gdpr-info.eu'
            },
            {
                type: 'context',
                title: 'Scenario: The Meeting Minutes',
                content: "You have a recording of a confidential faculty meeting about student disciplinary actions. You want to use an online tool to transcribe it instantly."
            },
            {
                type: 'skill',
                title: 'Which Action is Safe?',
                question: "What is the safest way to transcribe this meeting?",
                options: [
                    "Upload it to a free online AI transcriber",
                    "Paste the transcript into ChatGPT to summarize",
                    "Use a university-approved, secure transcription tool or type it manually"
                ],
                correctIndex: 2
            },
            {
                type: 'disposition',
                title: 'Reflection',
                content: "Convenience is the enemy of privacy. Always assume public AI tools store everything you type."
            }
        ]
    },
    "4": {
        id: 4,
        title: "EU AI Act Overview for Admin Work",
        sections: [
            { type: 'knowledge', title: 'The Pyramid of Risk', content: "The EU AI Act groups AI into four risks: Unacceptable (Banned), High Risk (Strict rules), Limited Risk (Transparency), and Minimal Risk (No rules).", sourceUrl: 'https://artificialintelligenceact.eu/', sourceLabel: 'EU AI Act — Full Text & Explained' },
            { type: 'context', title: 'Scenario: Chatbot Disclosure', content: "Your university installs a chatbot on the student support page. A student asks 'Am I talking to a human?'" },
            { type: 'skill', title: 'What is required?', question: "According to the 'Limited Risk' transparency rule, what must the chatbot do?", options: ["Nothing, it's efficient", "Say 'I am an AI'", "Pretend to be 'Sarah from Support'"], correctIndex: 1 },
            { type: 'disposition', title: 'Reflection', content: "Honesty builds trust. Hiding AI usage feels deceptive to students." }
        ]
    },
    "5": {
        id: 5,
        title: "High Risk vs Low Risk AI Systems",
        sections: [
            { type: 'knowledge', title: 'What is High Risk?', content: "AI affecting life chances is High Risk. Education and Employment are High Risk areas. Grading exams, sorting CVs, or assigning students to schools.", sourceUrl: 'https://artificialintelligenceact.eu/high-level-summary/', sourceLabel: 'EU AI Act — High-Level Summary' },
            { type: 'context', title: 'Scenario: The CV Sorter', content: "HR buys a tool to 'auto-reject' CVs that don't match keywords. This system affects employment opportunities." },
            { type: 'skill', title: 'Classify the Risk', question: "Is this CV Sorter 'High Risk' or 'Low Risk'?", options: ["Low Risk (it's just admin)", "High Risk (it decides careers)", "No Risk"], correctIndex: 1 },
            { type: 'disposition', title: 'Reflection', content: "High Risk doesn't mean 'Do not use'. It means 'Use with extreme care, logs, and human oversight'." }
        ]
    },
    "6": {
        id: 6,
        title: "Human Oversight and Responsibility",
        sections: [
            { type: 'knowledge', title: 'The Human in the Loop', content: "The 'Human in the Loop' principle means a human must verify AI decisions before they become final.", sourceUrl: 'https://artificialintelligenceact.eu/article/14/', sourceLabel: 'EU AI Act — Article 14: Human Oversight' },
            { type: 'context', title: 'Scenario: The Grade Dispute', content: "An AI grading assistant gives a student an 'F'. The student appeals. You are the admin in charge." },
            { type: 'skill', title: 'Your Duty', question: "What is your responsibility?", options: ["Tell the student 'The computer says F'", "Review the paper yourself to verify the grade", "Ignore the email"], correctIndex: 1 },
            { type: 'disposition', title: 'Reflection', content: "You are accountable. The AI is just a calculator. You sign the paper, not the algorithm." }
        ]
    }
}
