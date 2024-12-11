
import { NextFunction } from "express";
import { transaction } from "../../../model/transactionModel";
import crypto from 'crypto';

// Define specific transaction types for better type safety
export type TransactionType = "payment" | "subscription" | "deposit" | "withdrawal";

// Interface for transaction parameters
export interface TransactionParams {
    amount: number;
    type: TransactionType;
    patient_id?: string;
    doctor_id?: string;
}

// Type for the complete function including NextFunction
type CreateTransactionFunction = (
    next: NextFunction,
    params: TransactionParams
) => Promise<void>;

/**
 * Creates a new transaction record with a unique transaction ID
 * @param next - Express next function for error handling
 * @param params - Object containing transaction details (amount, type, optional IDs)
 */
export const createNewTransaction: CreateTransactionFunction = async (
    next,
    { amount, type, patient_id, doctor_id }
) => {
    // Generate unique transaction ID prefixed with 'TX-'
    const transactionId = 'TX-' + crypto.randomUUID().slice(0, 15);

    try {
        // Create transaction record in database
        await transaction.create({
            type,
            doctor_id,
            patient_id,
            amount,
            transaction_id: transactionId
        });
    } catch (error) {
        // Pass any errors to Express error handler
        next(error);
    }
};