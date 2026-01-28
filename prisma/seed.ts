import "dotenv/config";
import { PrismaClient, UserRole, CourseCategory } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({
    connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("🌱 Starting database seed...");

    // Clear existing data (optional - comment out if you want to keep existing data)
    await prisma.progress.deleteMany();
    await prisma.enrollment.deleteMany();
    await prisma.lesson.deleteMany();
    await prisma.course.deleteMany();
    await prisma.user.deleteMany();

    console.log("✅ Cleared existing data");

    // Create Users
    const adminUser = await prisma.user.create({
        data: {
            email: "admin@chaiacademy.edu",
            name: "Dr. Sarah Johnson",
            role: UserRole.ADMIN,
            department: "Computer Science",
            avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
        },
    });

    const learnerUser = await prisma.user.create({
        data: {
            email: "john.doe@chaiacademy.edu",
            name: "John Doe",
            role: UserRole.STAFF,
            department: "Business Administration",
            avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
        },
    });

    console.log("✅ Created 2 users (1 admin, 1 learner)");

    // Create Courses
    const aiBasicsCourse = await prisma.course.create({
        data: {
            title: "AI Fundamentals for Educators",
            description:
                "Learn the basics of artificial intelligence, machine learning, and how AI is transforming education. Perfect for beginners with no technical background.",
            category: CourseCategory.AI_FUNDAMENTALS,
            estimatedTime: 180, // 3 hours
            thumbnailUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995",
            isPublished: true,
            lessons: {
                create: [
                    {
                        title: "What is Artificial Intelligence?",
                        content: `# Introduction to AI

Artificial Intelligence (AI) refers to computer systems that can perform tasks that typically require human intelligence. This includes:

- **Learning**: Acquiring information and rules for using it
- **Reasoning**: Using rules to reach conclusions
- **Self-correction**: Improving through experience

## Key Concepts
- Machine Learning
- Neural Networks
- Natural Language Processing

## Real-World Applications
AI is already part of our daily lives through virtual assistants, recommendation systems, and smart devices.`,
                        order: 1,
                        duration: 45,
                    },
                    {
                        title: "Machine Learning Basics",
                        content: `# Understanding Machine Learning

Machine Learning is a subset of AI that enables systems to learn and improve from experience without being explicitly programmed.

## Types of Machine Learning
1. **Supervised Learning**: Learning from labeled data
2. **Unsupervised Learning**: Finding patterns in unlabeled data
3. **Reinforcement Learning**: Learning through trial and error

## Practical Examples
- Email spam filters
- Product recommendations
- Voice recognition`,
                        order: 2,
                        duration: 60,
                    },
                    {
                        title: "AI in Education",
                        content: `# How AI is Transforming Education

AI is revolutionizing the educational landscape in multiple ways:

## Personalized Learning
- Adaptive learning platforms
- Custom learning paths
- Real-time feedback

## Administrative Efficiency
- Automated grading
- Attendance tracking
- Resource allocation

## Student Support
- 24/7 AI tutors
- Learning analytics
- Early intervention systems`,
                        order: 3,
                        duration: 75,
                    },
                ],
            },
        },
        include: {
            lessons: true,
        },
    });

    const advancedAICourse = await prisma.course.create({
        data: {
            title: "Advanced AI Applications",
            description:
                "Dive deeper into AI technologies including deep learning, computer vision, and natural language processing. Explore cutting-edge applications and research.",
            category: CourseCategory.ADVANCED_AI,
            estimatedTime: 240, // 4 hours
            thumbnailUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485",
            isPublished: true,
            lessons: {
                create: [
                    {
                        title: "Deep Learning Architectures",
                        content: `# Deep Learning Fundamentals

Deep learning uses neural networks with multiple layers to progressively extract higher-level features from raw input.

## Popular Architectures
- **CNNs**: Convolutional Neural Networks for image processing
- **RNNs**: Recurrent Neural Networks for sequential data
- **Transformers**: State-of-the-art for NLP tasks

## Applications
- Image recognition
- Speech synthesis
- Language translation`,
                        order: 1,
                        duration: 90,
                    },
                    {
                        title: "Natural Language Processing",
                        content: `# NLP in Modern AI

Natural Language Processing enables computers to understand, interpret, and generate human language.

## Key Technologies
- Tokenization and embeddings
- Sentiment analysis
- Named entity recognition
- Large Language Models (LLMs)

## Use Cases in Education
- Automated essay grading
- Chatbots for student support
- Content generation
- Plagiarism detection`,
                        order: 2,
                        duration: 90,
                    },
                    {
                        title: "Computer Vision Applications",
                        content: `# Computer Vision in Practice

Computer vision enables machines to interpret and understand visual information from the world.

## Core Techniques
- Object detection
- Image segmentation
- Facial recognition
- Optical character recognition (OCR)

## Educational Applications
- Automated attendance
- Proctoring systems
- Accessibility tools
- Interactive learning materials`,
                        order: 3,
                        duration: 60,
                    },
                ],
            },
        },
        include: {
            lessons: true,
        },
    });

    const aiEthicsCourse = await prisma.course.create({
        data: {
            title: "AI Ethics and Responsible Use",
            description:
                "Explore the ethical implications of AI in education and society. Learn about bias, privacy, transparency, and responsible AI development practices.",
            category: CourseCategory.AI_ETHICS,
            estimatedTime: 150, // 2.5 hours
            thumbnailUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa",
            isPublished: true,
            lessons: {
                create: [
                    {
                        title: "Understanding AI Bias",
                        content: `# AI Bias and Fairness

AI systems can inadvertently perpetuate or amplify existing biases present in training data.

## Types of Bias
- **Data Bias**: Skewed or unrepresentative training data
- **Algorithmic Bias**: Flawed model design
- **Interaction Bias**: User behavior affecting outcomes

## Mitigation Strategies
- Diverse training datasets
- Regular audits and testing
- Transparent decision-making processes
- Inclusive design teams`,
                        order: 1,
                        duration: 50,
                    },
                    {
                        title: "Privacy and Data Protection",
                        content: `# Privacy in the AI Era

As AI systems collect and process vast amounts of data, protecting privacy becomes crucial.

## Key Principles
- Data minimization
- Purpose limitation
- Transparency and consent
- Security safeguards

## Regulations
- GDPR (Europe)
- FERPA (Education data in US)
- COPPA (Children's privacy)

## Best Practices
- Anonymization techniques
- Secure data storage
- Clear privacy policies
- User control over data`,
                        order: 2,
                        duration: 55,
                    },
                    {
                        title: "Responsible AI Implementation",
                        content: `# Building Ethical AI Systems

Implementing AI responsibly requires careful consideration of societal impact.

## Core Principles
1. **Transparency**: Explainable AI decisions
2. **Accountability**: Clear responsibility chains
3. **Fairness**: Equitable outcomes for all users
4. **Safety**: Robust and secure systems

## In Educational Settings
- Student data protection
- Equitable access to AI tools
- Human oversight in critical decisions
- Continuous monitoring and improvement

## Action Steps
- Develop AI ethics policies
- Train staff on responsible use
- Engage stakeholders in decisions
- Regular impact assessments`,
                        order: 3,
                        duration: 45,
                    },
                ],
            },
        },
        include: {
            lessons: true,
        },
    });

    console.log("✅ Created 3 courses with lessons");

    // Enroll the learner in all courses
    await prisma.enrollment.createMany({
        data: [
            { userId: learnerUser.id, courseId: aiBasicsCourse.id },
            { userId: learnerUser.id, courseId: advancedAICourse.id },
            { userId: learnerUser.id, courseId: aiEthicsCourse.id },
        ],
    });

    console.log("✅ Enrolled learner in all courses");

    // Mark some lessons as completed for the learner
    await prisma.progress.createMany({
        data: [
            {
                userId: learnerUser.id,
                lessonId: aiBasicsCourse.lessons[0].id,
                isCompleted: true,
                completedAt: new Date(),
            },
            {
                userId: learnerUser.id,
                lessonId: aiBasicsCourse.lessons[1].id,
                isCompleted: true,
                completedAt: new Date(),
            },
            {
                userId: learnerUser.id,
                lessonId: aiEthicsCourse.lessons[0].id,
                isCompleted: true,
                completedAt: new Date(),
            },
        ],
    });

    console.log("✅ Added progress tracking for learner");

    console.log("\n🎉 Database seeded successfully!");
    console.log("\n📊 Summary:");
    console.log("  - 2 users created");
    console.log("  - 3 courses created");
    console.log("  - 9 lessons created");
    console.log("  - 3 enrollments created");
    console.log("  - 3 progress records created");
}

main()
    .catch((e) => {
        console.error("❌ Error seeding database:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
