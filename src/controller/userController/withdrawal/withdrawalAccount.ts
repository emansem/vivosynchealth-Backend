import { NextFunction, Request, Response } from "express";
import { AppError } from "../../../middleware/errors";
import { withdrawalAccount } from "../../../model/withdrawalModel";
import { WithdrawalAccountData } from "../../../types";
import { hashPassword } from "../../../utils/password";
import { doctor } from "../../../model/doctorModel";
import { withdrawal } from "../../../model/withdrawal";



//Validate all withdrawal account details input
const validateWithdrawalAccountInputs = async (body: WithdrawalAccountData, next: NextFunction) => {
    try {
        if (!body.account_name || !body.bank_name || !body.account_number || !body.withdrawal_password) {
            throw new AppError("Please All fields are required", 400);
        } else if (isNaN(body.account_number)) {
            throw new AppError("Please provide a number", 400);
        }
        //hash the withdrawal pin password and save for security purpose
        return true
    } catch (error) {
        next(error)
        return false;
    }
}
export const createWithdrawalAccount = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user_id = (req as any).user;
        const { account_name, account_number, bank_name, withdrawal_password } = req.body as WithdrawalAccountData;

        const isValideInputs = await validateWithdrawalAccountInputs(req.body, next);
        if (!isValideInputs) return

        //check if the DOCTOR have a withdrawal account already if yes return an an error
        const findAccount = await withdrawalAccount.findOne({ where: { user_id } });
        if (findAccount) throw new AppError("You already have withdrawal account", 400);

        //check if they have already use the account number;
        const findAccountNumber = await withdrawalAccount.findOne({ where: { account_number: account_number } });
        if (findAccountNumber) throw new AppError("You can not use the same number for different accounts", 400);

        //save the user withdrawal account input details in to the database
        await withdrawalAccount.create(
            {
                user_id,
                account_name,
                account_number,
                bank_name,
                withdrawal_pin: await hashPassword(withdrawal_password)
            },

        );


        // find the account send the response back to the client when the withdrawal account is created
        const doctorWithdrawalAccount = await withdrawalAccount.findOne({ where: { user_id }, attributes: { exclude: ['withdrawal_pin'] } });
        res.status(201).json({
            status: "success",
            message: "Withdrawal account successfully created",
            data: {
                withdrawal_account: doctorWithdrawalAccount
            }
        })
    } catch (error) {
        next(error)
    }
}



//update the withdrawal account
export const updateWithdrawalAccount = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user_id = (req as any).user;
        const { bank_name, account_name, account_number } = req.body as WithdrawalAccountData

        await withdrawalAccount.update(
            { bank_name, account_name, account_number }, {
            where: { user_id }
        });

        //get the data back and send to client
        const findAccount = await withdrawalAccount.findOne({ where: { user_id }, attributes: { exclude: ['withdrawal_pin'] } });
        if (!findAccount) throw new AppError("No withdrawal account found", 404);
        res.status(200).json({
            status: "success",
            message: "Withdrawal account successfully updated",
            data: {
                withdrawal_account: findAccount
            }
        })
    } catch (error) {
        next()
    }
}

//Get the  doctor withdrawal account
export const getDoctorWithdrawalDetailsAndAccount = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user_id = (req as any).user;

        const doctorWithdrawalAccount = await withdrawalAccount.findOne({ where: { user_id }, attributes: { exclude: ['withdrawal_pin'] } });
        if (!doctorWithdrawalAccount) {
            res.status(200).json({
                status: "success",
                message: "Withdrawal account not found",
                account: doctorWithdrawalAccount
            })
            throw new AppError("Withdrawal account not found", 404);
        }
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

export const deleteDoctorWithdrawalAccount = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user_id = (req as any).user;

        const doctorWithdrawalAccount = await withdrawalAccount.destroy({ where: { user_id } });
        if (!doctorWithdrawalAccount) throw new AppError("No account found", 404); res.status(200).json({
            status: "success",
            message: "Withdrawal account successfully deleted"
        })
    } catch (error) {
        next(error)
    }
}

const getDoctorWithdrawalDetailsAndBalance = async (doctor_id: string, next: NextFunction) => {
    try {
        const WITHDRAWAL_STATUS = {
            SUCCESS: 'success',
            REJECTED: "rejected",
            PENDING: "pending"

        }
        const doctorDetails = await doctor.findOne({ where: { user_id: doctor_id } })
        const withdrawalDetails = await withdrawal.findAll({ where: { doctor_id } })

        const successWithdrawal = withdrawalDetails.reduce((total, withdrawal) => {
            if (withdrawal.dataValues.status === WITHDRAWAL_STATUS.SUCCESS) {
                return total + withdrawal.dataValues.amount;
            }
        }, 0)

        const rejectedWithdrawal = withdrawalDetails.reduce((total, withdrawal) => {
            if (withdrawal.dataValues.status === WITHDRAWAL_STATUS.REJECTED) {
                return total + withdrawal.dataValues.amount;
            }
        }, 0)

        const pendingWithdrawal = withdrawalDetails.reduce((total, withdrawal) => {
            if (withdrawal.dataValues.status === WITHDRAWAL_STATUS.PENDING) {
                return total + withdrawal.dataValues.amount;
            }
        }, 0)



        const withdrawalData = {
            successWithdrawal,
            rejectedWithdrawal,
            pendingWithdrawal,
            withdrawal_data: withdrawalDetails,
            totalBalance: doctorDetails?.dataValues.total_balance
        }

        return withdrawalData


    } catch (error) {
        next(error)
    }
}