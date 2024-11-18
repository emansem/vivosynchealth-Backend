import { NextFunction, Request, Response } from "express";
import { AppError } from "../../middleware/errors";
import findUser from "../../helper/findUser";
import { doctor } from "../../model/doctorModel";
import { patient } from "../../model/patientsModel";
import { generateJwt } from "../../utils/jwt";
import { generateEmailToken } from "../../helper/emailToken";
import { sendVerificationEmail } from "../../emails/email";

export const resendLInk = async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.body;
    try {
        if (!token) {
            throw new AppError("Please provide a valid token", 400);
        }
        const user = await findUserData(token, next);
        if (!user) {
            throw new AppError("Please provide a valid token", 400);
        }
        const user_type = user?.dataValues.user_type
        const id = user?.dataValues.user_id;
        const name = user?.dataValues.name;
        const email = user?.dataValues.email
        console.log(user)
        await updateUserData(id, user_type, res, next, name, email);



    } catch (error) {
        throw new AppError("Please provide a valid token", 400);
    }
}

const findUserData = async (token: string, next: NextFunction) => {

    try {
        //Find the user in the database by email token
        const user = await findUser(
            token,
            "email_verify_token",
            next,
            "Invlide token or token has expired",
            400
        ) as any;


        return user
    } catch (error) {
        next(error);
    }
}

const updateUserData = async (user_id: string, userType: string, res: Response, next: NextFunction, name: string, email: string) => {
    try {
        const user_type = userType === "patient" ? patient : doctor;
        if (!user_id) {
            throw new AppError("Invalid token or token has expired", 400)
        }
        const emailToken = generateEmailToken();
        await user_type.update(
            {
                email_verified: false,
                token_expires_in: Date.now() + 20 * 60 * 1000,
                email_verify_token: emailToken
            },
            { where: { user_id } })
        res.status(200).json({
            status: "success",
            message: "We have sent you a new email verification link, please check your email",

        })
        //send user email
        const veryLink = `http://localhost:3000/auth/verify-email-success?token=${emailToken}`
        await sendVerificationEmail(name, email, veryLink);
    } catch (error) {
        next(error)
    }
}