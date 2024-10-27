import { Response, Request, NextFunction } from "express";
import { AppError } from "./errors";
import { verifyTOken } from "../utils/jwt";
import findUser from "../helper/findUser";

export const protectedRoutes = async (req: Request, res: Response, next: NextFunction) => {

    try {

        const { authorization } = req.headers;
        if (!authorization) throw new AppError("Please login to access this page", 401)
        const token = authorization?.replace("Bearer", "").trim();

        const decordToken = verifyTOken(token);
        console.log('decord token', decordToken);
        if (!decordToken) throw new AppError('Please login to access this page', 401);

        const { id, exp } = decordToken as string | number | any;
        //check if the token has expired
        if (exp < Date.now() / 1000) throw new AppError("Session has expired, please login", 401);
        //check if the user exit in the database
        const user = await findUser(id, "id", next, "User not found please create an account", 404);
        (req as any).user = user?.dataValues.id
        next()
    } catch (error) {
        next(error);
    }
}