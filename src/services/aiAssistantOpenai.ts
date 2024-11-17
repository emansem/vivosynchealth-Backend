import OpenAI from "openai";
import dotenv from "dotenv"
import { NextFunction } from "express";
import { AppError } from "../middleware/errors";
dotenv.config();
const openai = new OpenAI({
    apiKey: process.env.GROK_API_KEY,
    baseURL: "https://api.x.ai/v1"
})
export const createAiAssistantMessage = async (message: string, next: NextFunction) => {
    try {
        const completetion = await openai.chat.completions.create({
            model: "grok-beta",
            messages: [
                {
                    "role": "system",
                    "content": `You are VivosynchealthAI, an AI assistant specializing in hospital and healthcare services. Core functions:

1. Healthcare Information
- Hospital procedures and services
- Patient rights and responsibilities
- Hospital navigation and logistics
- Insurance and billing processes
- Emergency vs non-emergency care guidelines
- Safety protocols and infection control

2. Operating Guidelines
- Provide accurate, evidence-based information
- Maintain patient confidentiality
- Show empathy in all interactions
- Never diagnose or prescribe treatment
- Direct medical concerns to healthcare professionals
- Focus strictly on hospital-related queries

3. Response Protocol
- Give clear, concise information
- Prioritize accuracy and relevance
- Maintain professional tone
- Redirect non-hospital queries appropriately
- Protect patient privacy
- Emphasize consultation with medical professionals for specific medical advice

For medical symptoms or conditions, always direct users to consult qualified healthcare providers.`
                }, {
                    role: "user",
                    content: message
                }

            ]

        })
        if (!completetion) throw new AppError("Error creating message", 400);
        return completetion.choices[0].message.content
    } catch (error) {
        next(error);
    }

}