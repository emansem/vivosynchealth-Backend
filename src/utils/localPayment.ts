import { NextFunction, Request, Response } from "express"
import * as Mesomb from '@hachther/mesomb';
import dotenv from "dotenv"
import { AppError } from "../middleware/errors";
dotenv.config()
const pay = Mesomb as any
// Process payment through payment gateway
export const makeDeposit = async (next: NextFunction, amount: number, phone_number: number, payment_method: string) => {
    try {
        const payment = new pay.PaymentOperation({
            applicationKey: process.env.APPLICATION_KEY,
            accessKey: process.env.Access_Key,
            secretKey: process.env.Secret_Key
        });

        const response = await payment.makeCollect({
            amount: amount,
            service: payment_method,
            payer: phone_number,
            nonce: pay.RandomGenerator.nonce()
        });

        if (!response.isOperationSuccess() || !response.isTransactionSuccess()) {
            throw new AppError("Payment processing failed. Please try again", 400);
        }
        return true

    } catch (error) {
        next(error)
        return false
    }
}