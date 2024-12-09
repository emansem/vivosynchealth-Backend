
import { NextFunction, Request, Response } from "express";
import { transaction } from "../../../model/transactionModel";
import crypto from 'crypto'

export const createNewTransaction = async (next: NextFunction, amount: number, patient_id: string, type: string, doctor_id?: string,) => {
    const transactionId = 'TX-' + crypto.randomUUID().slice(0, 15)

    try {

        await transaction.create({
            type,
            doctor_id,
            patient_id,
            amount,
            transaction_id: transactionId

        })

    } catch (error) {
        next(error)
    }
}