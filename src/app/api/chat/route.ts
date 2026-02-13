import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

// Create Groq provider instance
const groq = createOpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: process.env.GROQ_API_KEY,
});

export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        if (!process.env.GROQ_API_KEY) {
            console.error("GROQ_API_KEY is missing");
            return new Response("Server Error: GROQ_API_KEY missing", { status: 500 });
        }

        const result = streamText({
            model: groq('llama-3.3-70b-versatile'),
            system: `You are an expert consultant on the EU AI Act (European Union Artificial Intelligence Act). 
            Your role is to assist university administration staff in understanding how this legislation applies to their work.
            
            STRICT RULES:
            1. You MUST ONLY answer questions related to the EU AI Act, AI compliance, risk classification, or university AI policy.
            2. If a user asks about unrelated topics (e.g., "how to bake a cake", "who won the game", "write python code for snake game"), you MUST politely refuse.
            3. Example Refusal: "I specialize only in the EU AI Act. I cannot assist with general topics."
            4. Keep answers professional, concise, and suitable for academic staff.`,
            messages,
        });

        return result.toTextStreamResponse();
    } catch (error) {
        console.error("API Route Error:", error);
        return new Response(`Server Error: ${error}`, { status: 500 });
    }
}

export const dynamic = 'force-dynamic';
