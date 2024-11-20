
import { Response, Request, NextFunction } from "express"
import { patient } from "../../model/patientsModel";
import { AppError } from "../../middleware/errors";
import { doctor } from "../../model/doctorModel";
import findUser from "../../helper/findUser";
import { generateJwt } from "../../utils/jwt";

export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.body;
    console.log('email verification token', token)
    try {
        const userData = await findUserData(token, next)

        if (!userData && !userData.dataValues) {
            return next(new AppError("Invalid token or token has expired", 400))
        }
        const { user_id, user_type, } = userData.dataValues
        await updateUserData(user_id, user_type, res, next);
    }

    catch (error) {
        return next(error)
    }

}

//find user from the database
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

        if (user) {
            console.log(user)
            if (user?.dataValues.token_expires_in < Date.now()) {
                return next(new AppError('Token has expired, request a new token', 400))
            }
        }
        return user
    } catch (error) {
        next(error);
    }
}

//update email verified row, set email token to null, and expires time to null
const updateUserData = async (user_id: string, userType: string, res: Response, next: NextFunction) => {

    try {
        const user_type = userType === "patient" ? patient : doctor;
        if (!user_id) {
            throw new AppError("Invalid token or token has expired", 400)
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
            jwt: generateJwt(user_id)
        })
    } catch (error) {
        next(error)
    }
}