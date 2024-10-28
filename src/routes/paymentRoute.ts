import express from "express"
import { protectedRoutes } from "../middleware/protection";
import { collectLocalPayment } from "../controller/payments/collectLocalPayment";

export const paymentRoute = express.Router();
paymentRoute.post('/local-payment/:planId', protectedRoutes, collectLocalPayment)