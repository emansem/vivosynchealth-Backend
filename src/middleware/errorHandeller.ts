import { AppError } from "./errors";
import { Response, Request, NextFunction } from "express";

export const appErrorHandeler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
    const statusCode = err.statusCode || 500
    const message = err.message || 'Internal server Error';
    res.status(statusCode).json({
        status: 'Error',
        message
    })
} 