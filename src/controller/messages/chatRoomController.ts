import { NextFunction, Request, Response } from "express";
import { chatRoom } from "../../model/chatRoom";
import { Op } from "sequelize";

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