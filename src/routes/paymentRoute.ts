import express from "express"
import { protectedRoutes } from "../middleware/protection";
import { collectLocalPayment } from "../controller/payments/collectLocalPayment";
import { addAccountBalance } from "../controller/payments/addAccountBalance";
import { payWithAccountBalance } from "../controller/payments/payWithAccountBalance";

export const paymentRoute = express.Router();
paymentRoute.post('/collect/:planId', protectedRoutes, collectLocalPayment)
    .post('/add/balance', protectedRoutes, addAccountBalance)
    .post('/collect/pay-with-balance/:planId', protectedRoutes, payWithAccountBalance)