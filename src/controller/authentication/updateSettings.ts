import { NextFunction, Response, Request } from "express";
import { withdrawalAccount } from "../../model/withdrawalModel";
import { comparePassword, hashPassword } from "../../utils/password";
import { AppError } from "../../middleware/errors";
import findUser from "../../helper/findUser";
import { USER_TYPES } from "../../constant";
import { doctor } from "../../model/doctorModel";
import { patient } from "../../model/patientsModel";

interface ChangeWithdrawalPassword {
    newWithdrawalPassword: string;
    currentWithdrawalPassword: string;
    repeatWithdrawalPassword: string;
}

export const updateWithdrawalPassword = async (req: Request, res: Response, next: NextFunction) => {
    const user_id = (req as any).user;
    const { currentWithdrawalPassword, newWithdrawalPassword, repeatWithdrawalPassword } = req.body as ChangeWithdrawalPassword
    try {
        const withdrawalAccountDetails = await withdrawalAccount.findOne({ where: { user_id } })
        if (withdrawalAccountDetails && !await comparePassword(currentWithdrawalPassword, withdrawalAccountDetails.dataValues.withdrawal_pin)) {
            throw new AppError("Current wthdrawal password is incorrect", 400)
        } else if (newWithdrawalPassword !== repeatWithdrawalPassword) {
            throw new AppError("Password donot match, Try again", 400)
        } else if (newWithdrawalPassword === currentWithdrawalPassword) {
            throw new AppError("New password cannot be the same as old password", 400)
        }

        await withdrawalAccount.update({ withdrawal_pin: await hashPassword(newWithdrawalPassword) }, { where: { user_id } });
        res.status(200).json({
            status: "success",
            message: "Your withdrawal password has been updated"
        })
    } catch (error) {
        next(error)
    }

}

interface AccountPassword {
    newPassword: string;
    currentPassword: string;
    repeatPassword: string;
}

export const updateUserAccountPassword = async (req: Request, res: Response, next: NextFunction) => {
    const user_id = (req as any).user;
    const { newPassword, currentPassword, repeatPassword } = req.body as AccountPassword
    try {
        const user = await findUser(user_id, 'user_id', next, 'User account not found', 404);
        const userTypeMatch = user?.dataValues.user_type === USER_TYPES.DOCTOR ? doctor : patient

        if (user && !await comparePassword(currentPassword, user.dataValues.password)) {
            throw new AppError("Current password is incorrect", 400)
        } else if (newPassword !== repeatPassword) {
            throw new AppError("Password donot match, Try again", 400)
        } else if (newPassword === currentPassword) {
            throw new AppError("New password cannot be the same as old password", 400)
        }

        await userTypeMatch.update({ withdrawal_pin: await hashPassword(newPassword) }, { where: { user_id } });
        res.status(200).json({
            status: "success",
            message: "Your account password has been updated"
        })
    } catch (error) {
        next(error)
    }

}