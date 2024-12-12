import { NextFunction, Request, Response } from "express";
import { AppError } from "../../middleware/errors";
import findUser from "../../helper/findUser";
import { doctor } from "../../model/doctorModel";
import { patient } from "../../model/patientsModel";
import { generateEmailToken } from "../../helper/emailToken";
import { sendVerificationEmail } from "../../emails/email";
import { EMAIL_SUBJECT } from "../../constant";
import { sendResentPasswordEmail } from "../../emails/resetPasswordEmail";
import { ResendLinkRequest } from "../../types";

/**
 * Main controller to handle resending verification/reset password links
 * Handles both email verification and password reset scenarios
 */
export const resendLink = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Extract required data from request body
        const { email: userEmail, subject, token } = req.body as ResendLinkRequest
        console.log('token recieve', token)
        // Validate required fields
        if (!userEmail && !token) {
            return next(new AppError("Please provide a valid e,a", 400));
        }

        // Determine which value to use for finding the user
        // For password reset, use token; for email verification, use email
        const matchToken = subject === EMAIL_SUBJECT.RESET_PASSWORD ? token : userEmail;

        // Find user in database
        const user = await findUserData(matchToken as string, next, subject);

        // Validate user exists and has data
        if (!user || !user.dataValues) {
            return next(new AppError("user not found", 400));
        }

        // Extract user details
        const { user_type, user_id, name, email } = user.dataValues;

        // // Prevent resending if email is already verified
        // if (email_verified) {
        //     return next(new AppError("Email has been verified already", 400));
        // }

        // Process user update and email sending
        await updateUserData(user_id, user_type, res, next, name, email, subject);
    } catch (error) {
        return next(new AppError("Error processing request", 500));
    }
};

/**
 * Helper function to find user data based on email or reset token
 * @param findValue - Email or reset token to search for
 * @param next - Express next function for error handling
 * @param subject - Type of email (verification or reset password)
 */
const findUserData = async (findValue: string, next: NextFunction, subject: string) => {
    try {
        // Determine which field to search by based on the email subject
        const findKey = subject === EMAIL_SUBJECT.RESET_PASSWORD ? "password_reset_token" : "email";

        // Find user in database
        const user = await findUser(
            findValue,
            findKey,
            next,
            "User account not found, please create an account",
            400
        );

        return user;
    } catch (error) {
        return next(error);
    }
};

/**
 * Helper function to update user data and send appropriate emails
 
 */
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
        // Determine user model based on user type
        const user_type = userType === "patient" ? patient : doctor;

        // Validate user ID
        if (!user_id) {
            return next(new AppError("Invalid user ID", 400));
        }

        // Generate new email verification token
        const emailToken = generateEmailToken();
        // Set token expiry (60 seconds from now)
        const tokenExpiry = Date.now() + 60 * 1000;

        // Handle password reset scenario
        if (subject === EMAIL_SUBJECT.RESET_PASSWORD) {
            // Update user with new token and expiry
            await user_type.update(
                {
                    token_expires_in: tokenExpiry,
                    email_verify_token: emailToken,
                    password_reset_token: emailToken
                },
                { where: { user_id } }
            );
            // Send password reset email
            await sendResentPasswordEmail(name, email, emailToken);
        } else {
            // Update user for email verification
            await user_type.update(
                {
                    token_expires_in: tokenExpiry,
                    email_verify_token: emailToken,
                },
                { where: { user_id } }
            );

            // Handle email verification scenario
            if (subject === EMAIL_SUBJECT.VERIFY_EMAIL) {
                // Send verification email
                let sendingEmail = await sendVerificationEmail(name, email, emailToken, next);
                if (!sendingEmail) {
                    throw next(new AppError("Something went wrong,please try again", 500));
                }
            }
        }

        // Return success response
        return res.status(200).json({
            status: "success",
            message: "New verification code sent. Please check your email.",
            token: emailToken,
        });
    } catch (error) {
        console.error("Email sending error:", error);
        return next(error);
    }
};