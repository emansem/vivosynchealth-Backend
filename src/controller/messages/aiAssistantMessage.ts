import { NextFunction, Request, Response } from "express";
import { AppError } from "../../middleware/errors";
import { createAiAssistantMessage } from "../../services/aiAssistantOpenai";
import { messageAssistant } from "../../model/messageAssistant";

export const createNewAssistantMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user_id = (req as any).user;
        const { message: user_message } = req.body;
        if (!user_message) throw new AppError("Please type something before sending", 400);
        const message = await createAiAssistantMessage(user_message, next);
        //Save message to the database
        const savedMessage = await messageAssistant.create({
            message,
            user_id,
            user_prompt: user_message
        })
        if (!savedMessage) throw new AppError("Error creating message", 400)
        res.status(201).json({
            status: "success",
            data: {
                ai_response: message,
                user_prompt: user_message
            }
        })
    } catch (error) {
        next(error);
    }
}