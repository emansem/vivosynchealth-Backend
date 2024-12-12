import { NextFunction, Request, Response } from "express";
import findUser from "../helper/findUser";
import { AppError } from "./errors";

export const authoriseUserAccess = (allowedUserTypes: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user_id = (req as any).user;

            const user = await findUser(user_id, 'user_id', next, "User not found", 404);

            if (!user) {
                throw new AppError("Authentication failed: User not found", 404);
            }

            const hasAccess = allowedUserTypes.includes(user.dataValues.user_type);
            if (!hasAccess) {
                throw new AppError(
                    `Access denied: ${user.dataValues.user_type} role cannot access this resource`,
                    403
                );
            }

            next();
        } catch (error) {
            next(error instanceof AppError ? error : new AppError("Authorization failed", 500));
        }
    };
};


