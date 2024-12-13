/**
 * @file passwordController.ts
 * @description Handles password update operations for user accounts
 */

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

interface AccountPassword {
    newPassword: string;
    currentPassword: string;
    repeatPassword: string;
}

/**
 * Updates the withdrawal password for a user
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @throws {AppError} - Throws 400 for validation errors
 */
export const updateWithdrawalPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const user_id = (req as any).user;
    const {
        currentWithdrawalPassword,
        newWithdrawalPassword,
        repeatWithdrawalPassword,
    } = req.body as ChangeWithdrawalPassword;

    try {
        // Find user's withdrawal account
        const withdrawalAccountDetails = await withdrawalAccount.findOne({
            where: { user_id },
        });

        // Validate current password
        const isCurrentPasswordValid =
            withdrawalAccountDetails &&
            (await comparePassword(
                currentWithdrawalPassword,
                withdrawalAccountDetails.dataValues.withdrawal_pin
            ));

        if (!isCurrentPasswordValid) {
            throw new AppError("Current withdrawal password is incorrect", 400);
        }

        // Validate new password
        if (newWithdrawalPassword !== repeatWithdrawalPassword) {
            throw new AppError("Passwords do not match, Try again", 400);
        }

        if (newWithdrawalPassword === currentWithdrawalPassword) {
            throw new AppError("New password cannot be the same as old password", 400);
        }

        // Update password in database
        await withdrawalAccount.update(
            { withdrawal_pin: await hashPassword(newWithdrawalPassword) },
            { where: { user_id } }
        );

        // Send success response
        res.status(200).json({
            status: "success",
            message: "Your withdrawal password has been updated",
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Updates the account password for a doctor or patient
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @throws {AppError} - Throws 400 for validation errors, 404 for user not found
 */
export const updateUserAccountPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const user_id = (req as any).user;
    const { newPassword, currentPassword, repeatPassword } =
        req.body as AccountPassword;

    try {
        // Find and validate user exists
        const user = await findUser(
            user_id,
            "user_id",
            next,
            "User account not found",
            404
        );

        // Determine user type model
        const userTypeMatch =
            user?.dataValues.user_type === USER_TYPES.DOCTOR ? doctor : patient;

        // Validate current password
        const isCurrentPasswordValid =
            user && (await comparePassword(currentPassword, user.dataValues.password));

        if (!isCurrentPasswordValid) {
            throw new AppError("Current password is incorrect", 400);
        }

        // Validate new password
        if (newPassword !== repeatPassword) {
            throw new AppError("Passwords do not match, Try again", 400);
        }

        if (newPassword === currentPassword) {
            throw new AppError("New password cannot be the same as old password", 400);
        }

        // Update password in database
        await userTypeMatch.update(
            { password: await hashPassword(newPassword) },
            { where: { user_id } }
        );

        // Send success response
        res.status(200).json({
            status: "success",
            message: "Your account password has been updated",
        });
    } catch (error) {
        next(error);
    }
};