export type QuestionType = 'MC' | 'ORDERING' | 'LIKERT';

export interface AssessmentQuestion {
    id: string;
    category: 'LITERACY' | 'AFFECTIVE';
    type: QuestionType;
    text: string;
    options?: { value: string; label: string }[];
    items?: string[]; // For ordering questions
    scaleTitle?: string; // For grouping affective variables
}

export const assessmentQuestions: AssessmentQuestion[] = [
    // --- 1. AI Literacy (Knowledge) - 10 Questions ---
    {
        id: 'K01',
        category: 'LITERACY',
        type: 'MC',
        text: 'In which of these areas is AI typically applied?',
        options: [
            { value: '1', label: 'Detecting credit card fraud' },
            { value: '2', label: 'Cryptocurrency mining' },
            { value: '3', label: 'Web tracking' },
            { value: '4', label: 'Encryption for instant messaging services' }
        ]
    },
    {
        id: 'K02',
        category: 'LITERACY',
        type: 'MC',
        text: 'Which of the following interdisciplinary research fields is also a subfield of AI?',
        options: [
            { value: '1', label: 'Blockchain' },
            { value: '2', label: 'Natural Language Processing' },
            { value: '3', label: 'Psychology of Learning' },
            { value: '4', label: 'Bioinformatics' }
        ]
    },
    {
        id: 'K03',
        category: 'LITERACY',
        type: 'MC',
        text: 'For which task was AI first shown to be superior to human experts?',
        options: [
            { value: '1', label: 'detecting tumors' },
            { value: '2', label: 'conducting software projects' },
            { value: '3', label: 'translating novels' },
            { value: '4', label: 'designing cancer therapies' }
        ]
    },
    {
        id: 'K04',
        category: 'LITERACY',
        type: 'MC',
        text: 'How does supervised learning differ from unsupervised learning?',
        options: [
            { value: '1', label: 'In supervised learning, the output values of the training data are known' },
            { value: '2', label: 'In supervised learning, humans must supervise the AI during learning' },
            { value: '3', label: 'In supervised learning, all computational steps are documented' },
            { value: '4', label: 'In supervised learning, stricter legal regulations apply' }
        ]
    },
    {
        id: 'K05',
        category: 'LITERACY',
        type: 'ORDERING',
        text: 'Sort the process steps in supervised learning into the correct order:',
        items: [
            '1. Train model with training data',
            '2. Predict test data with the model',
            '3. Collect and prepare data',
            '4. Divide data into training and test data',
            '5. Calculate accuracy of prediction'
        ]
    },
    {
        id: 'K06',
        category: 'LITERACY',
        type: 'MC',
        text: 'How do AI developers most typically shape the results of the machine learning process?',
        options: [
            { value: '1', label: 'Accuracy calculation' },
            { value: '2', label: 'Randomized division' },
            { value: '3', label: 'Selection of the model' },
            { value: '4', label: 'Abstraction of the model' }
        ]
    },
    {
        id: 'K07', // Added to make 10
        category: 'LITERACY',
        type: 'MC',
        text: 'In AI, a distinction can be made between "weak" and "strong" AI. "Weak AI" refers to AI systems that have capabilities in a limited area. "Strong AI," on the other hand, is said to be capable of a very broad range of tasks, similar to humans. Which of these examples could be considered strong AI?',
        options: [
            { value: '1', label: 'an intelligent virtual assistant (e.g. Alexa)' },
            { value: '2', label: 'a fully self-driving car' },
            { value: '3', label: 'a powerful search engine (e.g. Google)' },
            { value: '4', label: 'strong AI does not exist at the moment' }
        ]
    },
    {
        id: 'K08', // Added to make 10
        category: 'LITERACY',
        type: 'MC',
        text: 'What can weak AI NOT do?',
        options: [
            { value: '1', label: 'make decisions under uncertainty' },
            { value: '2', label: 'solve a wide range of tasks' },
            { value: '3', label: 'solve a task better than a human' },
            { value: '4', label: 'learn from unstructured data' }
        ]
    },
    {
        id: 'K09',
        category: 'LITERACY',
        type: 'MC',
        text: 'What is the black box problem?',
        options: [
            { value: '1', label: 'AI entails a residual risk that is hard to calculate' },
            { value: '2', label: 'It is often difficult to determine how an AI system makes decisions' },
            { value: '3', label: 'Users are often not informed AI is being used' },
            { value: '4', label: 'Many users have little knowledge about AI' }
        ]
    },
    {
        id: 'K10',
        category: 'LITERACY',
        type: 'MC',
        text: 'What is a central risk in using AI for predictive policing?',
        options: [
            { value: '1', label: 'vulnerability to hacking' },
            { value: '2', label: 'discrimination against suspects based on origin and status' },
            { value: '3', label: 'lack of legal certainty' },
            { value: '4', label: 'undermining authority' }
        ]
    },

    // --- 2. Affective Variables (LIKERT 1-5) - 21 Items ---

    // Interest in AI
    { id: 'IK01', category: 'AFFECTIVE', type: 'LIKERT', scaleTitle: 'Interest in AI', text: 'I generally have fun when I am learning about AI.' },
    { id: 'IK02', category: 'AFFECTIVE', type: 'LIKERT', scaleTitle: 'Interest in AI', text: 'I like reading about AI.' },
    { id: 'IK03', category: 'AFFECTIVE', type: 'LIKERT', scaleTitle: 'Interest in AI', text: 'I like to work on problems in the field of AI.' },
    { id: 'IK04', category: 'AFFECTIVE', type: 'LIKERT', scaleTitle: 'Interest in AI', text: 'I enjoy acquiring new knowledge about AI.' },
    { id: 'IK05', category: 'AFFECTIVE', type: 'LIKERT', scaleTitle: 'Interest in AI', text: 'I am interested in learning new things about AI.' },

    // AI Self-efficacy
    { id: 'SE01', category: 'AFFECTIVE', type: 'LIKERT', scaleTitle: 'AI Self-efficacy', text: 'I have a good understanding of the basic principles of AI.' },
    { id: 'SE02', category: 'AFFECTIVE', type: 'LIKERT', scaleTitle: 'AI Self-efficacy', text: 'I know about various uses of AI.' },
    { id: 'SE03', category: 'AFFECTIVE', type: 'LIKERT', scaleTitle: 'AI Self-efficacy', text: 'I understand what "intelligence" means in the context of AI.' },
    { id: 'SE04', category: 'AFFECTIVE', type: 'LIKERT', scaleTitle: 'AI Self-efficacy', text: 'I am aware of the strengths and weaknesses of AI.' },
    { id: 'SE05', category: 'AFFECTIVE', type: 'LIKERT', scaleTitle: 'AI Self-efficacy', text: 'I am familiar with how AI works.' },
    { id: 'SE06', category: 'AFFECTIVE', type: 'LIKERT', scaleTitle: 'AI Self-efficacy', text: 'I understand to what extent humans can influence AI.' },
    { id: 'SE07', category: 'AFFECTIVE', type: 'LIKERT', scaleTitle: 'AI Self-efficacy', text: 'I can analyze, illustrate, and critically interpret data.' },
    { id: 'SE08', category: 'AFFECTIVE', type: 'LIKERT', scaleTitle: 'AI Self-efficacy', text: 'I am familiar with the ethical issues surrounding AI.' },

    // Attitudes towards AI
    { id: 'EI01', category: 'AFFECTIVE', type: 'LIKERT', scaleTitle: 'Attitudes towards AI', text: 'I am interested in using AI systems in my daily life.' },
    { id: 'EI02', category: 'AFFECTIVE', type: 'LIKERT', scaleTitle: 'Attitudes towards AI', text: 'There are many beneficial applications of AI.' },
    { id: 'EI03', category: 'AFFECTIVE', type: 'LIKERT', scaleTitle: 'Attitudes towards AI', text: 'AI is exciting.' },
    { id: 'EI04', category: 'AFFECTIVE', type: 'LIKERT', scaleTitle: 'Attitudes towards AI', text: 'Much of society will benefit from a future full of AI.' },
    { id: 'EI05', category: 'AFFECTIVE', type: 'LIKERT', scaleTitle: 'Attitudes towards AI', text: 'I think AI is dangerous.' },
    { id: 'EI06', category: 'AFFECTIVE', type: 'LIKERT', scaleTitle: 'Attitudes towards AI', text: 'I find AI sinister.' },
    { id: 'EI07', category: 'AFFECTIVE', type: 'LIKERT', scaleTitle: 'Attitudes towards AI', text: 'AI might take control of people.' },
    { id: 'EI08', category: 'AFFECTIVE', type: 'LIKERT', scaleTitle: 'Attitudes towards AI', text: 'I shiver with discomfort when I think about future uses of AI.' }
];
