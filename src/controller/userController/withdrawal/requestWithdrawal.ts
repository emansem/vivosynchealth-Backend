import { NextFunction, Request, Response } from "express"
import { AppError } from "../../../middleware/errors";
import { withdrawalAccount } from "../../../model/withdrawalModel";
import findUser from "../../../helper/findUser";
import { comparePassword } from "../../../utils/password";
import { doctor } from "../../../model/doctorModel";
import { withdrawal } from "../../../model/withdrawal";
import crypto from 'crypto'


// Handler for processing withdrawal requests from doctors
export const requestWithdrawal = async (req: Request, res: Response, next: NextFunction) => {
    // Get authenticated doctor's ID from request
    const doctor_id = (req as any).user;
    const { amount, password } = req.body

    try {
        // Check if required fields are provided
        if (!amount || !password) {
            throw new AppError("All fields are required", 400)
        }

        // Find doctor's withdrawal account settings
        const withdrawalAccountDetails = await withdrawalAccount.findOne({
            where: { user_id: doctor_id }
        });

        // Get doctor's account details including balance
        const userDetails = await findUser(
            doctor_id,
            'user_id',
            next,
            'No user account found for this user',
            404
        )

        // Check if withdrawal account exists
        if (!withdrawalAccountDetails) {
            throw new AppError("No withdrawal account, please set your withdrawal account", 404)
        }

        // Verify doctor has sufficient balance
        if (userDetails?.dataValues.total_balance < amount) {
            throw new AppError("Insufficient Balance", 400);
        }

        // Verify withdrawal password is correct
        if (!await comparePassword(password, withdrawalAccountDetails?.dataValues.withdrawal_pin)) {
            throw new AppError('Withdrawal password is incorrect ', 400);
        }

        // Update doctor's balance by subtracting withdrawal amount
        await doctor.decrement('total_balance', {
            by: amount,
            where: { user_id: doctor_id }
        })

        //generate a unique transaction id
        const transactionId = 'TX-' + crypto.randomUUID().slice(0, 15)

        //Save the details into withdrawal tabel in the database
        const withdrawalDetails = await withdrawal.create({
            doctor_id,
            amount,
            transaction_id: transactionId,
            status: "pending"
        })

        // Send success response
        res.status(201).json({
            status: "success",
            message: "You have successfully requested for a withdrawal",
            data: {
                details: withdrawalDetails
            }
        })

    } catch (error) {
        // Pass any errors to error handling middleware
        next(error)
    }
}