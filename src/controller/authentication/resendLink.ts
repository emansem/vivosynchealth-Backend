import { NextFunction, Request, Response } from "express";
import { AppError } from "../../middleware/errors";
import findUser from "../../helper/findUser";
import { doctor } from "../../model/doctorModel";
import { patient } from "../../model/patientsModel";
import { generateEmailToken } from "../../helper/emailToken";
import { sendVerificationEmail } from "../../emails/email";


export const resendLInk = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email: userEmail } = req.body;


        console.log("Email verification token", userEmail)

        if (!userEmail) {
            return next(new AppError("Please provide a valid token", 400));
        }

        const user = await findUserData(userEmail, next);
        if (!user || !user.dataValues) {
            return next(new AppError("Invalid user or token", 400));
        }

        const { user_type, user_id, name, email } = user.dataValues;

        await updateUserData(user_id, user_type, res, next, name, email);
    } catch (error) {
        return next(new AppError("Error processing request", 500));
    }
};

const findUserData = async (token: string, next: NextFunction) => {
    try {
        const user = await findUser(
            token,
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
    email: string
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
                email_verified: false,
                token_expires_in: tokenExpiry,
                email_verify_token: emailToken
            },
            { where: { user_id } }
        );

        // Try to send email
        const verifyLink = `http://localhost:3000/auth/verify-email-success?token=${emailToken}`;
        await sendVerificationEmail(name, email, verifyLink);

        // Only send success response if everything worked
        return res.status(200).json({
            status: "success",
            message: "New verification link sent. Please check your email."
        });

    } catch (error) {
        console.error("Email sending error:", error);
        return next(new AppError("Failed to send verification email", 500));
    }
};