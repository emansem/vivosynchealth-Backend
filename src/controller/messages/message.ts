import { NextFunction, Request, Response } from "express";
import { MessageType } from "../../types";
import { AppError } from "../../middleware/errors";
import { message } from "../../model/messageModel";

export const messageController = async (req: Request, res: Response, next: NextFunction) => {
    const user_id = (req as any).user;
    try {
        const { content, receiver_id, chatRoomId, } = req.body as MessageType
        if (!content || !receiver_id || !chatRoomId) {
            throw new AppError("Please provide all fields", 400)
        }
        const messageData = await message.create({
            chat_room: chatRoomId,
            sender_id: user_id,
            receiver_id: receiver_id,
            content,
            status: "sent",
        })
        res.status(201).json({
            status: "success",
            data: {
                message: messageData
            }
        })
    } catch (error) {
        next(error)
    }
}