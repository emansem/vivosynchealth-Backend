
import { NextFunction, Response, Request } from "express";
import { AppError } from "../../middleware/errors";
import findUser from "../../helper/findUser";

export const verifyPasswordResetToken = async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.body;
    console.log("Reset token", token)
    try {
        if (!token) {
            throw new AppError("Invalid token,Please provide a valid token", 400);
        }
        //find the user in the database 
        const user = await findUser(token, "password_reset_token", next, "Invalid token or token has expired", 400);
        if (!user) {
            throw new AppError("No user found, please create an account", 401);
        }
        const tokenExpireTime = user.dataValues.token_expires_in;
        const now = Date.now();
        if (tokenExpireTime < now) {
            throw new AppError("Token has expired, request a new token", 400);
        }
        res.status(200).json({
            status: "success",
            message: "Your email has been verified, you can proceed to reset your password"
        })
    } catch (error) {
        return next(error)
    }
}