import { NextFunction, Request, Response } from "express"
import * as Mesomb from '@hachther/mesomb';
import dotenv from "dotenv"
import { AppError } from "../../middleware/errors";
import { makeDeposit } from "../../utils/localPayment";
import { deposit } from "../../model/deposit";
import { patient } from "../../model/patientsModel";
import crypto from "crypto"
import { createNewTransaction } from "../userController/transaction/createNewTransaction";
dotenv.config()
const pay = Mesomb as any

export const addAccountBalance = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const patient_id = (req as any).user;
        const { phone_number, payment_method, amount } = req.body;
        const paymentNumber = parseInt(phone_number);
        const paymentAmount = parseInt(amount);
        if (!phone_number || !payment_method || !amount) {
            throw new AppError("All fields are required", 400)
        }
        const payment = await makeDeposit(next, amount, paymentNumber, payment_method);
        if (!payment) {
            throw new AppError("Payment processing failed.Please try again", 400);
        }
        await patient.increment('balance', { by: paymentAmount, where: { user_id: patient_id } })

        const savePaymentDetails = await deposit.create({
            payment_id: crypto.randomUUID(),
            amount: paymentAmount,
            patient_id,

        })
        // if (!savePaymentDetails) throw new AppError("Error saving deposit details", 400)

        res.status(201).json({
            status: "success",
            message: "Payment was successfully, Your account has been credited",
            data: {
                payment: savePaymentDetails
            }
        })
        await createNewTransaction(next, paymentAmount, patient_id, "deposit")

    } catch (error) {
        next(error)
    }
}

