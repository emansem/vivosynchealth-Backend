import { Response, Request, NextFunction } from "express";
import { AppError } from "./errors";
import { verifyTOken } from "../utils/jwt";
import findUser from "../helper/findUser";
import { getUserCurrentLocation } from "../services/getUserLocation";
import { USER_TYPES } from "../constant";



export const protectedRoutes = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const userLocation = await getUserCurrentLocation();
        // const userIp = userLocation.geoplugin_request
        const { authorization } = req.headers;

        if (!authorization) throw new AppError("Please login to access this page", 401)
        const token = authorization?.replace("Bearer", "").trim();
        if (!token) {
            throw new AppError("Please provid a valid token", 401)
        }

        const decordToken = verifyTOken(token);

        if (!decordToken) {
            // res.status(403).json({
            //     redirectUrl: '/login',
            //     message: "Please complete your profile to access this page"
            // });
            throw new AppError('Please login to access this page', 401);

        }

        const { id, exp, iat } = decordToken as string | number | any;
        //check if the token has expired

        if (exp < Date.now() / 1000) throw new AppError("Session has expired, please login", 401);

        //check if the user exit in the database
        const user = await findUser(id, "user_id", next, "User not found, please create an account", 404);

        if (!user) throw new AppError("User not found", 404)
        // if (!userLocation) throw new AppError("Error fetching user location", 400)
        const { user_type, isProfileCompleted } = user.dataValues
        // if (user_type === USER_TYPES.DOCTOR && !isProfileCompleted) {
        //     res.status(403).json({
        //         redirectUrl: '/onboard/doctor',
        //         message: "Please complete your profile to access this page"
        //     });
        //     throw new AppError("Please complete your profile to access this page", 400)
        // }
        const userIp = userLocation?.geoplugin_request;

        const lastChangePassword = user?.dataValues.password_updated_at;
        //check the last time the user change his password, the last time the user login and check if the IP address has change
        // console.log("pasword change date", lastChangePassword)
        // if (lastChangePassword !== iat) {
        //     throw new AppError("Please login to continue", 401);
        // }
        (req as any).user = user?.dataValues.user_id
        next()
    } catch (error) {
        next(error);
    }
}