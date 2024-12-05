import { NextFunction, Request, Response } from "express";
import { MessageType } from "../../types";
import { AppError } from "../../middleware/errors";
import { message } from "../../model/messageModel";
import { io } from "../..";

export const messageController = async (req: Request, res: Response, next: NextFunction) => {
    console.log('1. Message controller started');
    const user_id = (req as any).user;

    try {
        const { content, receiver_id, chatRoomId } = req.body as MessageType;
        console.log('2. Received message data:', { content, receiver_id, chatRoomId });

        if (!content || !receiver_id || !chatRoomId) {
            throw new AppError("Please provide all fields", 400);
        }

        const messageData = await message.create({
            chat_room: chatRoomId,
            sender_id: user_id,
            receiver_id,
            content,
            status: "sent",
        });
        console.log('3. Message saved to database:', messageData);

        // Log before emitting
        console.log('4. Attempting to emit to room:', chatRoomId);
        io.to(chatRoomId).emit('new_message', {
            content: messageData.dataValues.content,
            receiver_id,
            sender_id: user_id,
            chatRoomId,
            timestamp: messageData.dataValues.created_at

        });
        console.log('5. Emit completed');

        res.status(201).json({
            status: "success",
            data: { message: messageData }
        });

    } catch (error) {
        console.error('Error in message controller:', error);
        next(error);
    }
};