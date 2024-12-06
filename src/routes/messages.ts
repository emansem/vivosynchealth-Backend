
import express from "express";
import { protectedRoutes } from "../middleware/protection";
import { createNewAssistantMessage } from "../controller/messages/aiAssistantMessage";
import { getActiveSubscription } from "../controller/messages/getActiveSubscription";
import { chatRoomController, getAllUserMessages } from "../controller/messages/chatRoomController";
import { messageController } from "../controller/messages/message";

export const messageRoutes = express.Router();
messageRoutes
    .post("/ai-assistant", protectedRoutes, createNewAssistantMessage)
    .get("/subscription/active", protectedRoutes, getActiveSubscription)
    .post("/chat-room/find", protectedRoutes, chatRoomController)
    .post('/send-message', protectedRoutes, messageController)
    .get("/all-messages/:chatRoomId", protectedRoutes, getAllUserMessages)