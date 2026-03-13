export interface AssessmentQuestion {
    id: string;
    category: 'LITERACY' | 'AFFECTIVE';
    text: string;
    options?: { value: string; label: string }[];
}

export const assessmentQuestions: AssessmentQuestion[] = [
    // --- AI Literacy Test (Multiple Choice) ---
    {
        id: 'AI01',
        category: 'LITERACY',
        text: 'In which of these areas is AI typically applied?',
        options: [
            { value: '1', label: 'Detecting credit card fraud' },
            { value: '2', label: 'Cryptocurrency mining' },
            { value: '3', label: 'Web tracking' },
            { value: '4', label: 'Encryption for instant messaging services' }
        ]
    },
    {
        id: 'AI02',
        category: 'LITERACY',
        text: 'Imagine you are chatting with an assistant on the Internet. What’s one strategy you could attempt to find out whether you are interacting with a human or with an AI?',
        options: [
            { value: '1', label: 'You can save yourself the effort, since it is impossible to distinguish between a human and an AI in written communication.' },
            { value: '2', label: 'You could ask a difficult factual question, since only a human can answer it.' },
            { value: '3', label: 'You could make a few typing errors in your text, then the AI can no longer understand you, but a human can.' },
            { value: '4', label: 'You could make an ironic remark, because this is better understood by humans.' }
        ]
    },
    {
        id: 'AI03',
        category: 'LITERACY',
        text: 'Which of the following systems often use AI?',
        options: [
            { value: '1', label: 'Air traffic control systems' },
            { value: '2', label: 'Geopositioning systems' },
            { value: '3', label: '3D printing systems' },
            { value: '4', label: 'Inventory management systems' }
        ]
    },
    {
        id: 'AI04',
        category: 'LITERACY',
        text: 'Which of the following interdisciplinary research fields is also a subfield of AI?',
        options: [
            { value: '1', label: 'Blockchain' },
            { value: '2', label: 'Natural Language Processing' },
            { value: '3', label: 'Psychology of Learning' },
            { value: '4', label: 'Bioinformatics' }
        ]
    },
    {
        id: 'AI05',
        category: 'LITERACY',
        text: 'What makes AI intelligent?',
        options: [
            { value: '1', label: 'AI can walk and talk.' },
            { value: '2', label: 'AI has an artificial brain.' },
            { value: '3', label: 'AI is at least as intelligent as humans.' },
            { value: '4', label: 'AI acts rationally to achieve a particular goal as well as possible.' }
        ]
    },
    {
        id: 'AI06',
        category: 'LITERACY',
        text: 'Why do AI systems behave intelligently?',
        options: [
            { value: '1', label: 'They have no feelings that could distract them from their task.' },
            { value: '2', label: 'They think autonomously and pursue their own goals.' },
            { value: '3', label: 'They have been programmed to try to achieve a given goal as well as possible.' },
            { value: '4', label: 'They are built similar to the human brain and therefore have a similar intelligence.' }
        ]
    },
    {
        id: 'AI07',
        category: 'LITERACY',
        text: 'In AI, a distinction can be made between "weak" and "strong" AI. "Weak AI" refers to AI systems that have capabilities in a limited area. "Strong AI," on the other hand, is said to be capable of a very broad range of tasks, similar to humans. Which of these examples could be considered strong AI?',
        options: [
            { value: '1', label: 'an intelligent virtual assistant (e.g. Alexa)' },
            { value: '2', label: 'a fully self-driving car' },
            { value: '3', label: 'a powerful seach engine (e.g. Google)' },
            { value: '4', label: 'strong AI does not exist at the moment' }
        ]
    },
    {
        id: 'AI08',
        category: 'LITERACY',
        text: 'What can weak AI NOT do?',
        options: [
            { value: '1', label: 'make decisions under uncertainty' },
            { value: '2', label: 'solve a wide range of tasks' },
            { value: '3', label: 'solve a task better than a human' },
            { value: '4', label: 'learn from unstructured data' }
        ]
    },
    {
        id: 'AI09',
        category: 'LITERACY',
        text: 'For which task was AI first shown to be superior to human experts?',
        options: [
            { value: '1', label: 'detecting tumors' },
            { value: '2', label: 'conducting software projects' },
            { value: '3', label: 'translating novels' },
            { value: '4', label: 'designing cancer therapies' }
        ]
    },
    {
        id: 'AI10',
        category: 'LITERACY',
        text: 'In which of these areas are humans still likely to have advantages compared to AI?',
        options: [
            { value: '1', label: 'predicting extreme weather events from weather data' },
            { value: '2', label: 'finding a proof for a mathematical theorem' },
            { value: '3', label: 'answering quiz questions' },
            { value: '4', label: 'playing poker' }
        ]
    },
    {
        id: 'AI11',
        category: 'LITERACY',
        text: 'What are knowledge representations in the field of AI?',
        options: [
            { value: '1', label: 'encoding of knowledge in AI systems in a way that humans can understand' },
            { value: '2', label: 'sensors that capture information from the environment' },
            { value: '3', label: 'information about the world that can be processed by a computer' },
            { value: '4', label: 'an algorithm that generates knowledge from data' }
        ]
    },
    {
        id: 'AI13',
        category: 'LITERACY',
        text: 'How do AI systems make decisions?',
        options: [
            { value: '1', label: 'based on mathematical-logical principles' },
            { value: '2', label: 'based on links defined by programmers' },
            { value: '3', label: 'based on quantum entanglement' },
            { value: '4', label: 'based on artificial intuition' }
        ]
    },
    {
        id: 'AI14',
        category: 'LITERACY',
        text: 'What is a key criterion for the quality of a model in machine learning?',
        options: [
            { value: '1', label: 'it can predict the output values of the test data as well as possible' },
            { value: '2', label: 'it contains as few variables as possible' },
            { value: '3', label: 'it is as well adapted as possible to the training data' },
            { value: '4', label: 'the predictions are as unambiguous as possible' }
        ]
    },
    {
        id: 'AI15',
        category: 'LITERACY',
        text: 'How does supervised learning differ from unsupervised learning?',
        options: [
            { value: '1', label: 'in supervised learning, the output values of the training data are known' },
            { value: '2', label: 'in supervised learning, humans must supervise the AI during learning and intervene if necessary' },
            { value: '3', label: 'in supervised learning, all computational steps are documented' },
            { value: '4', label: 'in supervised learning, stricter legal regulations apply' }
        ]
    },
    {
        id: 'AI16',
        category: 'LITERACY',
        text: 'Which statement about the steps in the machine learning process is correct?',
        options: [
            { value: '1', label: 'the steps of the process are based on behaviorist learning theories' },
            { value: '2', label: 'the development of a machine learning model is in part an iterative process' },
            { value: '3', label: 'the steps of the process of supervised and unsupervised learning are basically the same' },
            { value: '4', label: 'the steps of the process can be performed in reverse to generate an (artificial) data set' }
        ]
    },
    {
        id: 'AI18',
        category: 'LITERACY',
        text: 'What should be considered in machine learning when dividing the data into training and test data?',
        options: [
            { value: '1', label: 'The data should be divided into parts of as equal size as possible.' },
            { value: '2', label: 'The data should be randomly divided into training and test data sets.' },
            { value: '3', label: 'The test data should be of higher quality than the training data.' },
            { value: '4', label: 'The training and test data should be as different from each other as possible.' }
        ]
    },
    {
        id: 'AI19',
        category: 'LITERACY',
        text: 'How do AI developers most typically shape the results of the machine learning process?',
        options: [
            { value: '1', label: 'through calculation of the accuracy of the prediction' },
            { value: '2', label: 'through randomized division into test and training data' },
            { value: '3', label: 'through selection of the model' },
            { value: '4', label: 'through abstraction of the model' }
        ]
    },
    {
        id: 'AI20',
        category: 'LITERACY',
        text: 'To what extent can humans influence the results of the machine learning process?',
        options: [
            { value: '1', label: 'Humans can hardly influence the result of machine learning, since it runs automatically.' },
            { value: '2', label: 'The results can only be influenced when selecting the data the model learns from.' },
            { value: '3', label: 'Humans can influence the result during development at several different steps in the process.' },
            { value: '4', label: 'Humans can only influence the interpretation of the results.' }
        ]
    },
    {
        id: 'AI21',
        category: 'LITERACY',
        text: 'What primarily determines the behavior of AI systems?',
        options: [
            { value: '1', label: 'AI systems strive for autonomy.' },
            { value: '2', label: 'AI systems pursue a goal that has been given to them by humans.' },
            { value: '3', label: 'AI systems perform behaviors randomly.' },
            { value: '4', label: 'AI systems seek out goals independently and pursue them.' }
        ]
    },
    {
        id: 'AI22',
        category: 'LITERACY',
        text: 'What is one benefit of data visualizations?',
        options: [
            { value: '1', label: 'Maintaining transparency' },
            { value: '2', label: 'Preparation of training for image recognition' },
            { value: '3', label: 'Communication of results' },
            { value: '4', label: 'Conducting statistical tests' }
        ]
    },
    {
        id: 'AI23',
        category: 'LITERACY',
        text: 'Why can systems based on machine learning obtain good results?',
        options: [
            { value: '1', label: 'Their work is often observed by humans and corrected if necessary ("supervised learning").' },
            { value: '2', label: 'They think similarly to humans, but are faster.' },
            { value: '3', label: 'They can draw conclusions from large amounts of data and thereby improve their model.' },
            { value: '4', label: 'They are derived from expert systems in which expert knowledge is stored.' }
        ]
    },
    {
        id: 'AI24',
        category: 'LITERACY',
        text: 'What data do AI-based recommender systems used by streaming services primarily rely on?',
        options: [
            { value: '1', label: 'the data of every user when using the service' },
            { value: '2', label: 'all data that a user of the service leaves on the Internet' },
            { value: '3', label: 'the data of other users, but not one’s own' },
            { value: '4', label: 'only one’s own data when using the service' }
        ]
    },
    {
        id: 'AI25',
        category: 'LITERACY',
        text: 'You are testing a machine learning model that is supposed to classify images of animals. You notice that the model is better at recognizing cats than dogs. What could be the reason for this?',
        options: [
            { value: '1', label: 'Dogs are more difficult to recognize than cats, since there are fewer images of dogs on the internet.' },
            { value: '2', label: 'Small objects (cats) are better recognized than large ones (dogs).' },
            { value: '3', label: 'Most models are generally better at recognizing cats than dogs.' },
            { value: '4', label: 'The training data of the dogs were not representative of all dog breeds.' }
        ]
    },
    {
        id: 'AI27',
        category: 'LITERACY',
        text: 'What is the black box problem?',
        options: [
            { value: '1', label: 'AI entails a residual risk that is hard to calculate.' },
            { value: '2', label: 'It is often difficult to determine how an AI system makes decisions.' },
            { value: '3', label: 'Users are often not informed that an AI system is being used.' },
            { value: '4', label: 'Many users have little knowledge about AI.' }
        ]
    },
    {
        id: 'AI28',
        category: 'LITERACY',
        text: 'Which societal challenge is frequently mentioned in the context of AI?',
        options: [
            { value: '1', label: 'a lack of investment in the educational system' },
            { value: '2', label: 'chip shortage in industry due to the high computational cost of AI' },
            { value: '3', label: 'high error rate in AI-enabled manufacturing' },
            { value: '4', label: 'the replacement of human workers by AI' }
        ]
    },
    {
        id: 'AI29',
        category: 'LITERACY',
        text: 'What is a central risk in using AI for predictive policing?',
        options: [
            { value: '1', label: 'vulnerability to hacking' },
            { value: '2', label: 'discrimination against suspects based on origin and status' },
            { value: '3', label: 'lack of legal certainty in the event of an AI failure' },
            { value: '4', label: 'undermining the authority of police officers' }
        ]
    },
    {
        id: 'AI30',
        category: 'LITERACY',
        text: 'Which legal challenge do AI applications entail?',
        options: [
            { value: '1', label: 'users of AI have no option for legal protection' },
            { value: '2', label: 'protecting the rights of AI itself' },
            { value: '3', label: 'lawyers do not understand the importance of AI' },
            { value: '4', label: 'limited control of AI because of its autonomy' }
        ]
    },

    // --- Affective Variables (Likert Scale: 1-5) ---
    {
        id: 'IK01',
        category: 'AFFECTIVE',
        text: 'I generally have fun when I am learning about AI.',
    },
    {
        id: 'IK02',
        category: 'AFFECTIVE',
        text: 'I like reading about AI.',
    },
    {
        id: 'IK03',
        category: 'AFFECTIVE',
        text: 'I like to work on problems in the field of AI.',
    },
    {
        id: 'IK04',
        category: 'AFFECTIVE',
        text: 'I enjoy acquiring new knowledge about AI.',
    },
    {
        id: 'IK05',
        category: 'AFFECTIVE',
        text: 'I am interested in learning new things about AI.',
    },
    {
        id: 'SE01',
        category: 'AFFECTIVE',
        text: 'I have a good understanding of the basic principles of AI.',
    },
    {
        id: 'SE02',
        category: 'AFFECTIVE',
        text: 'I know about various uses of AI.',
    },
    {
        id: 'SE03',
        category: 'AFFECTIVE',
        text: 'I understand what "intelligence" means in the context of AI.',
    },
    {
        id: 'SE04',
        category: 'AFFECTIVE',
        text: 'I am aware of the strengths and weaknesses of AI.',
    },
    {
        id: 'SE05',
        category: 'AFFECTIVE',
        text: 'I am familiar with how AI works.',
    },
    {
        id: 'SE06',
        category: 'AFFECTIVE',
        text: 'I understand to what extent humans can influence AI.',
    },
    {
        id: 'SE07',
        category: 'AFFECTIVE',
        text: 'I can analyze, illustrate, and critically interpret data.',
    },
    {
        id: 'SE08',
        category: 'AFFECTIVE',
        text: 'I am familiar with the ethical issues surrounding AI.',
    },
    {
        id: 'EI01',
        category: 'AFFECTIVE',
        text: 'I am interested in using AI systems in my daily life.',
    },
    {
        id: 'EI02',
        category: 'AFFECTIVE',
        text: 'There are many beneficial applications of AI.',
    },
    {
        id: 'EI03',
        category: 'AFFECTIVE',
        text: 'AI is exciting.',
    },
    {
        id: 'EI04',
        category: 'AFFECTIVE',
        text: 'Much of society will benefit from a future full of AI.',
    },
    {
        id: 'EI05',
        category: 'AFFECTIVE',
        text: 'I think AI is dangerous.',
    },
    {
        id: 'EI06',
        category: 'AFFECTIVE',
        text: 'I find AI sinister.',
    },
    {
        id: 'EI07',
        category: 'AFFECTIVE',
        text: 'AI might take control of people.',
    },
    {
        id: 'EI08',
        category: 'AFFECTIVE',
        text: 'I shiver with discomfort when I think about future uses of AI.',
    }
];
