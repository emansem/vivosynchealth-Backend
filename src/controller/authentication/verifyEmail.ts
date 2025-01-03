
import { Response, Request, NextFunction } from "express"
import { patient } from "../../model/patientsModel";
import { AppError } from "../../middleware/errors";
import { doctor } from "../../model/doctorModel";
import findUser from "../../helper/findUser";
import { generateJwt } from "../../utils/jwt";

export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    const { token, subject } = req.body;
    console.log('email verification token', token)
    try {
        const userData = await findUserData(token, next, res)

        if (!userData && !userData.dataValues) {
            return next(new AppError("Verification code is incorrect", 400))
        }
        const { user_id, user_type, } = userData.dataValues
        await updateUserData(user_id, user_type, res, next, subject);
    }

    catch (error) {
        return next(error)
    }

}

//find user from the database
const findUserData = async (token: string, next: NextFunction, res: Response) => {

    try {
        //Find the user in the database by email token
        const user = await findUser(
            token,
            "email_verify_token",
            next,
            "Verification code is incorrect",
            400
        ) as any;

        if (user) {
            if (user?.dataValues.token_expires_in < Date.now()) {
                res.status(401).json({
                    status: "Error",
                    message: "Token has expired, request a new token",
                    hasEmailTokenExpire: true,
                    email: user.dataValues.email,
                    emailVerified: user.dataValues.email_verified,
                })
                return next(new AppError('Token has expired, request a new token', 400))
            }
        }
        return user
    } catch (error) {
        next(error);
    }
}

//update email verified row, set email token to null, and expires time to null
const updateUserData = async (user_id: string, userType: string, res: Response, next: NextFunction, subject: string) => {

    try {
        const user_type = userType === "patient" ? patient : doctor;
        if (!user_id) {
            throw new AppError("Verification code is incorrect", 400)
        }
        await user_type.update(
            {
                email_verified: true,
                token_expires_in: null,
                email_verify_token: null
            },
            { where: { user_id } })
        res.status(200).json({
            message: "Email has been successfully verified",
            jwt: generateJwt(user_id),
            user_type: userType,
            email_subject: subject,
        })
    } catch (error) {
        next(error)
    }
}