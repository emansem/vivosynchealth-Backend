import { NextFunction, Request, Response } from "express";
import { chatRoom } from "../../model/chatRoom";
import { Op } from "sequelize";
import { AppError } from "../../middleware/errors";
import { message } from "../../model/messageModel";

// 2. Backend: Finding or creating a chat room
export const chatRoomController = async (req: Request,
    res: Response,
    next: NextFunction) => {

    try {
        const currentUserId = (req as any).user;
        const { receiverId } = req.body;

        console.log(`Looking for chat room between ${currentUserId} and ${receiverId}`);
        // Output: "Looking for chat room between user123 and user456"

        // Check if these users already have a room
        let chatRoomId = await chatRoom.findOne({
            where: {
                [Op.or]: [
                    // Case 1: currentUser is sender, other user is receiver
                    {
                        sender_id: currentUserId,
                        receiver_id: receiverId
                    },
                    // Case 2: currentUser is receiver, other user is sender
                    {
                        sender_id: receiverId,
                        receiver_id: currentUserId
                    }
                ]
            }
        });

        if (chatRoomId) {
            console.log('Found existing room:', chatRoomId?.dataValues.id);
            res.json({ chatRoomId: chatRoomId?.dataValues.id });
            return
        } else {
            // If no room exists, create a new one
            chatRoomId = await chatRoom.create({
                sender_id: currentUserId,
                receiver_id: receiverId
            })
            console.log('Created new room:', chatRoomId?.dataValues.id);
            res.json({ chatRoomId: chatRoomId?.dataValues.id });

            // Output: "Created new room: 6789"
        }

    } catch (error) {
        next(error)
    }
}

//Get all messages

export const getAllUserMessages = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Better parameter handling with type checking
        const chatRoomId = req.params.chatRoomId


        console.log("Processing request for chat room:", chatRoomId);

        // Validation with more specific error message
        if (!chatRoomId) {
            throw new AppError("Chat room ID is required in the query parameters", 400);
        }

        // Add proper ordering and any necessary joins
        const messages = await message.findAll({
            where: { chat_room: chatRoomId },
            order: [['created_at', 'ASC']], // Messages in chronological order

        });

        // Handle no messages case
        if (messages.length === 0) {
            res.status(200).json({
                status: "success",
                message: "No messages found for this chat room",
                data: {
                    messages: []
                }
            });
            return
        }

        // Success case with proper 200 status
        res.status(200).json({
            status: "success",
            message: "Successfully retrieved all messages",
            data: {
                messages,
                count: messages.length
            }
        });

    } catch (error) {
        // Let the error middleware handle the error
        next(error);
    }
};