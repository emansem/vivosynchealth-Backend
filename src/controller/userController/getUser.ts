import { NextFunction, Request, Response } from "express";
import findUser from "../../helper/findUser";
import { AppError } from "../../middleware/errors";

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
    const user_id = (req as any).user;
    console.log('user account id', user_id)
    try {
        const findUserData = await findUser(user_id, 'user_id', next, "User not found", 404)
        console.log(findUserData)
        if (!findUserData) {
            throw new AppError("User account not found", 400);
        } else {
            res.status(200).json({
                status: "success",
                message: "User found",
                email: findUserData?.dataValues.email,
                isEmailVerified: findUserData?.dataValues.email_verified,
                isProfileCompleted: findUserData.dataValues.isProfileCompleted,
                TokenExpireTime: findUserData.dataValues.token_expires_in,
                user_type: findUserData.dataValues.user_type,

            })
        }
    } catch (error) {
        console.log("Error finding user", error)
    }
}