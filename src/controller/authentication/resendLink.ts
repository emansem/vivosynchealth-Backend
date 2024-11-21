import { NextFunction, Request, Response } from "express";
import { AppError } from "../../middleware/errors";
import findUser from "../../helper/findUser";
import { doctor } from "../../model/doctorModel";
import { patient } from "../../model/patientsModel";
import { generateEmailToken } from "../../helper/emailToken";
import { sendVerificationEmail } from "../../emails/email";
import { sendResentPasswordEmail } from "../../emails/resetPasswordEmail";


export const resendLInk = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email: userEmail, subject } = req.body;

        if (!userEmail) {
            return next(new AppError("Please provide a valid token", 400));
        }

        const user = await findUserData(userEmail, next);
        if (!user || !user.dataValues) {
            return next(new AppError("Invalid user or token", 400));
        }

        const { user_type, user_id, name, email_verified, email } = user.dataValues;
        if (subject === 'RESET_PASSWORD' && email_verified) {
            await updateUserData(user_id, user_type, res, next, name, email, subject);
            return
        }
        else if (email_verified) {
            return next(new AppError("Email has been verified already", 400));
        }

        await updateUserData(user_id, user_type, res, next, name, email, subject);
    } catch (error) {
        return next(new AppError("Error processing request", 500));
    }
};

const findUserData = async (email: string, next: NextFunction) => {
    try {
        const user = await findUser(
            email,
            "email",
            next,
            "User account not found, please create an account",
            400
        );

        if (!user) {
            return next(new AppError("Invalid token", 400));
        }

        return user;
    } catch (error) {
        return next(error);
    }
};

const updateUserData = async (
    user_id: string,
    userType: string,
    res: Response,
    next: NextFunction,
    name: string,
    email: string,
    subject: string
) => {
    try {
        const user_type = userType === "patient" ? patient : doctor;

        if (!user_id) {
            return next(new AppError("Invalid user ID", 400));
        }

        const emailToken = generateEmailToken();
        const tokenExpiry = Date.now() + 60 * 1000;

        // Update user first
        await user_type.update(
            {

                token_expires_in: tokenExpiry,
                email_verify_token: emailToken
            },
            { where: { user_id } }
        );

        // Try to send email
        const verifyLink = `http://localhost:3000/auth/verify-email-success?token=${emailToken}`;
        if (subject !== 'RESET_PASSWORD' && subject) {
            const sendingEmail = await sendVerificationEmail(name, email, verifyLink, next);
            if (!sendingEmail) {
                return next(new AppError("Something went wrong,please try again", 500));
            }
            const resetLink = `http://localhost:3000/auth/verify/password-token?token=${emailToken}`
            //send the user email link to verify his account
            await sendResentPasswordEmail(name, email, resetLink);

        }


        // Only send success response if everything worked
        return res.status(200).json({
            status: "success",
            message: "New verification link sent. Please check your email."
        });

    } catch (error) {
        console.error("Email sending error:", error);
        return next(error)
    }
};