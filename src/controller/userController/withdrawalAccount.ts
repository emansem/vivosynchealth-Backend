import { NextFunction, Request, Response } from "express";
import { AppError } from "../../middleware/errors";
import { comparePassword, hashPassword } from "../../utils/password";
import { withdrawalAccount } from "../../model/withdrawalModel";
import { doctor } from "../../model/doctorModel";

interface WithdrawalTypes {
    account_name: string;
    account_number: number;
    withdrawal_pin: string;
    payment_method: string;
    password: string
}

//Validate all withdrawal account details input
const validateWithdrawalAccountInputs = async (body: WithdrawalTypes, next: NextFunction) => {
    try {
        if (!body.account_name || !body.payment_method || !body.account_number || !body.withdrawal_pin) {
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
        const doctor_id = (req as any).user;
        const { account_name, account_number, payment_method, withdrawal_pin } = req.body as WithdrawalTypes;

        const isValideInputs = await validateWithdrawalAccountInputs(req.body, next);
        if (!isValideInputs) return

        //check if the DOCTOR have a withdrawal account already if yes return an an error
        const findAccount = await withdrawalAccount.findOne({ where: { doctor_id: doctor_id } });
        if (findAccount) throw new AppError("You already have withdrawal account", 400);
        //check if they have already use the account number;
        const findAccountNumber = await withdrawalAccount.findOne({ where: { account_number: account_number } });
        if (findAccountNumber) throw new AppError("You can not use the same number for different accounts", 400);
        //save the user withdrawal account input details in to the database
        await withdrawalAccount.create(
            {
                doctor_id,
                account_name,
                account_number,
                payment_method,
                withdrawal_pin: await hashPassword(withdrawal_pin)
            },

        );


        // find the account send the response back to the client when the withdrawal account is created
        const doctorWithdrawalAccount = await withdrawalAccount.findOne({ where: { doctor_id: doctor_id }, attributes: { exclude: ['withdrawal_pin'] } });
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

//Check if the doctor has submitted all the fields to update or just update the once he submited since the updates is optional 

const checkUpdatedInputs = async (body: WithdrawalTypes, next: NextFunction, doctor_id: number) => {
    try {
        const updatedInputs: any = {}
        const findDoctor = await doctor.findOne({ where: { id: doctor_id } });
        if (!findDoctor) throw new AppError("Please login to continue", 401);

        //check if the doctor has submitted the password because is required
        if (!body.password) throw new AppError("Password is required", 400);
        const hashPassword = findDoctor.dataValues.password;
        const isPasswordValid = await comparePassword(body.password, hashPassword);
        if (!isPasswordValid) throw new AppError("Please provide a valid password", 400);
        if (body.account_name) updatedInputs.account_name = body.account_name;
        if (body.account_number) updatedInputs.account_number = body.account_number;
        if (body.payment_method) updatedInputs.payment_method = body.payment_method;
        return updatedInputs;
    } catch (error) {
        next(error);
        return false
    }
}

//update the withdrawal account
export const updateWithdrawalAccount = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const doctor_id = (req as any).user;
        const dataToUpdate = await checkUpdatedInputs(req.body, next, doctor_id);
        if (!dataToUpdate) return
        await withdrawalAccount.update(dataToUpdate, { where: { doctor_id: doctor_id } });

        //get the data back and send to client
        const findAccount = await withdrawalAccount.findOne({ where: { doctor_id: doctor_id }, attributes: { exclude: ['withdrawal_pin'] } });
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
export const getDoctorWithdrawalAccount = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const doctor_id = (req as any).user;

        const doctorWithdrawalAccount = await withdrawalAccount.findOne({ where: { doctor_id: doctor_id }, attributes: { exclude: ['withdrawal_pin'] } });
        if (!doctorWithdrawalAccount) throw new AppError("No account found", 404); res.status(200).json({
            status: "success",
            data: {
                withdrawal_account: doctorWithdrawalAccount
            }
        })
    } catch (error) {
        next(error)
    }
}

export const deleteDoctorWithdrawalAccount = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const doctor_id = (req as any).user;

        const doctorWithdrawalAccount = await withdrawalAccount.destroy({ where: { doctor_id: doctor_id } });
        if (!doctorWithdrawalAccount) throw new AppError("No account found", 404); res.status(200).json({
            status: "success",
            message: "Withdrawal account successfully deleted"
        })
    } catch (error) {
        next(error)
    }
}