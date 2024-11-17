
import express from "express";
import { protectedRoutes } from "../middleware/protection";
import { createNewAssistantMessage } from "../controller/messages/aiAssistantMessage";

export const messageRoutes = express.Router();
messageRoutes
    .post("/ai-assistant", protectedRoutes, createNewAssistantMessage)