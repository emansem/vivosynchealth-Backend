import { NextFunction, Request, Response } from "express";
import { AppError } from "../../../middleware/errors";
import { withdrawalAccount } from "../../../model/withdrawalModel";
import { WithdrawalAccountData } from "../../../types";
import { hashPassword } from "../../../utils/password";
import { doctor } from "../../../model/doctorModel";
import { withdrawal } from "../../../model/withdrawal";
import { WITHDRAWAL_STATUS } from "../../../constant";

// Helper function to validate all required fields for withdrawal account creation
// Checks for presence of account details and validates account number format
const validateWithdrawalAccountInputs = async (body: WithdrawalAccountData, next: NextFunction) => {
    try {
        // Check if all required fields are provided
        if (!body.account_name || !body.bank_name || !body.account_number || !body.withdrawal_password) {
            throw new AppError("Please All fields are required", 400);
        }
        // Ensure account number contains only numeric values
        else if (isNaN(body.account_number)) {
            throw new AppError("Please provide a number", 400);
        }
        return true
    } catch (error) {
        next(error)
        return false;
    }
}

// Handles creation of a new withdrawal account for doctors
// Creates account after validating inputs and checking for duplicates
export const createWithdrawalAccount = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Get authenticated user ID and required account details
        const user_id = (req as any).user;
        const { account_name, account_number, bank_name, withdrawal_password } = req.body as WithdrawalAccountData;

        // Validate all input fields
        const isValideInputs = await validateWithdrawalAccountInputs(req.body, next);
        if (!isValideInputs) return

        // Prevent duplicate withdrawal accounts for the same doctor
        const findAccount = await withdrawalAccount.findOne({ where: { user_id } });
        if (findAccount) throw new AppError("You already have withdrawal account", 400);

        // Ensure account number is unique across all withdrawal accounts
        const findAccountNumber = await withdrawalAccount.findOne({ where: { account_number: account_number } });
        if (findAccountNumber) throw new AppError("You can not use the same number for different accounts", 400);

        // Create new withdrawal account with hashed password
        await withdrawalAccount.create({
            user_id,
            account_name,
            account_number,
            bank_name,
            withdrawal_pin: await hashPassword(withdrawal_password)
        });

        // Retrieve created account (excluding sensitive pin) and send response
        const doctorWithdrawalAccount = await withdrawalAccount.findOne({
            where: { user_id },
            attributes: { exclude: ['withdrawal_pin'] }
        });
        res.status(201).json({
            status: "success",
            message: "Withdrawal account successfully created",
            data: { withdrawal_account: doctorWithdrawalAccount }
        })
    } catch (error) {
        next(error)
    }
}

// Updates existing withdrawal account details
export const updateWithdrawalAccount = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user_id = (req as any).user;
        const { bank_name, account_name, account_number } = req.body as WithdrawalAccountData

        // Update account details in database
        await withdrawalAccount.update(
            { bank_name, account_name, account_number },
            { where: { user_id } }
        );

        // Retrieve and return updated account details
        const findAccount = await withdrawalAccount.findOne({
            where: { user_id },
            attributes: { exclude: ['withdrawal_pin'] }
        });
        if (!findAccount) throw new AppError("No withdrawal account found", 404);
        res.status(200).json({
            status: "success",
            message: "Withdrawal account successfully updated",
            data: { withdrawal_account: findAccount }
        })
    } catch (error) {
        next()
    }
}

// Retrieves doctor's withdrawal account details and transaction history
export const getDoctorWithdrawalDetailsAndAccount = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user_id = (req as any).user;

        // Get withdrawal account details
        const doctorWithdrawalAccount = await withdrawalAccount.findOne({
            where: { user_id },
            attributes: { exclude: ['withdrawal_pin'] }
        });
        if (!doctorWithdrawalAccount) {
            res.status(200).json({
                status: "success",
                message: "Withdrawal account not found",
                account: doctorWithdrawalAccount
            })
            throw new AppError("Withdrawal account not found", 404);
        }

        // Get withdrawal history and balance details
        const withdrawal_details = await getDoctorWithdrawalDetailsAndBalance(user_id, next)

        res.status(200).json({
            status: "success",
            message: "Successfully retreived the withdrawal account",
            data: {
                account: doctorWithdrawalAccount,
                withdrawal_details
            }
        })
    } catch (error) {
        next(error)
    }
}

// Deletes doctor's withdrawal account
export const deleteDoctorWithdrawalAccount = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user_id = (req as any).user;

        // Remove account from database
        const doctorWithdrawalAccount = await withdrawalAccount.destroy({ where: { user_id } });
        if (!doctorWithdrawalAccount) throw new AppError("No account found", 404);
        res.status(200).json({
            status: "success",
            message: "Withdrawal account successfully deleted"
        })
    } catch (error) {
        next(error)
    }
}

// Helper function to calculate withdrawal statistics and balance
// Returns total successful, rejected, and pending withdrawals along with current balance
const getDoctorWithdrawalDetailsAndBalance = async (doctor_id: string, next: NextFunction) => {
    try {
        // Get doctor details and all withdrawal transactions
        const doctorDetails = await doctor.findOne({ where: { user_id: doctor_id } })
        const withdrawalDetails = await withdrawal.findAll({ where: { doctor_id } })

        // Calculate total successful withdrawals
        const successWithdrawal = withdrawalDetails.reduce((total, withdrawal) => {
            if (withdrawal.dataValues.status === WITHDRAWAL_STATUS.SUCCESS) {
                return total + withdrawal.dataValues.amount;
            }
        }, 0)

        // Calculate total rejected withdrawals
        const rejectedWithdrawal = withdrawalDetails.reduce((total, withdrawal) => {
            if (withdrawal.dataValues.status === WITHDRAWAL_STATUS.REJECTED) {
                return total + withdrawal.dataValues.amount;
            }
        }, 0)

        // Calculate total pending withdrawals
        const pendingWithdrawal = withdrawalDetails.reduce((total, withdrawal) => {
            if (withdrawal.dataValues.status === WITHDRAWAL_STATUS.PENDING) {
                return total + withdrawal.dataValues.amount;
            }
        }, 0)

        // Compile withdrawal statistics and return
        const withdrawalData = {
            successWithdrawal: successWithdrawal || 0,
            rejectedWithdrawal: rejectedWithdrawal || 0,
            pendingWithdrawal: pendingWithdrawal || 0,
            withdrawal_data: withdrawalDetails,
            totalBalance: doctorDetails?.dataValues.total_balance || 0
        }

        return withdrawalData

    } catch (error) {
        next(error)
    }
}