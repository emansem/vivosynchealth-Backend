import { NextFunction, Request, Response } from "express";
import { MessageType } from "../../types";
import { AppError } from "../../middleware/errors";
import { message } from "../../model/messageModel";
import { io } from "../..";
import { chatRoom } from "../../model/chatRoom";
import { Op, where } from "sequelize";

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
            timestamp: new Date()

        });
        console.log('3. Message saved to database:', messageData);

        // Log before emitting
        console.log('4. Attempting to emit to room:', chatRoomId);
        io.to(chatRoomId).emit('new_message', {
            content: messageData.dataValues.content,
            receiver_id,
            sender_id: user_id,
            chatRoomId,
            timestamp: messageData.dataValues.timestamp

        });
        io.to(chatRoomId).emit('last_message', {
            content,
            sender_id: user_id,
            receiver_id,


        });
        await saveLastSendMessage(chatRoomId, content, user_id, next)
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

const saveLastSendMessage = async (chatRoomId: string, content: string, last_senderId: string, next: NextFunction) => {
    try {
        const saveMessage = await chatRoom.update(
            {
                content,
                last_senderId,
            },
            {
                where:
                    { id: chatRoomId }
            }
        )
    } catch (error) {
        next(error)
    }

}

export const getLastSentMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user_id = (req as any).user;

        // Find messages where the user is either sender or receiver
        const lastSendMessage = await chatRoom.findAll({
            where: {
                [Op.or]: [
                    { last_senderId: user_id },
                    { receiver_id: user_id }
                ]
            },
            order: [['created_at', 'DESC']], // Get most recent messages first

        });

        console.log("Last sent message ", lastSendMessage)

        if (!lastSendMessage || lastSendMessage.length === 0) {
            res.status(200).json({  // Changed to 200 since empty array is valid
                status: "success",
                message: "No messages found",
                data: {
                    messages: []
                }
            });
            return
        }

        res.status(200).json({
            status: 'success',
            message: "Successfully retrieved the last messages",
            data: {
                messages: lastSendMessage
            }

        });
    } catch (error) {
        next(error);
    }
};