import { NextFunction } from "express";
import { AdminSupportRequest } from "../types";
import { AppError } from "../middleware/errors";

export const calculatePerecentageDff = (totalDifferences: number, lastMonthDff: number, thisMonthDff: number) => {
    let percentage = 0;
    if (thisMonthDff === 0 && lastMonthDff === 0) {
        percentage = 0
    } else if (lastMonthDff === 0 && thisMonthDff > 0) {
        percentage = 100  // When going from 0 to some doctors
    }
    else if (lastMonthDff > 0 && thisMonthDff === 0) {
        percentage = -100 // When losing all doctors
    } else {
        percentage = (totalDifferences / lastMonthDff) * 100
    }
    return { percentage }
}

export const generateTicketId = () => {

    let result = "TK-";
    for (let i = 0; i < 6; i++) {

        result += Math.floor(Math.random() * 10);

    }
    return result;
}

export const validateSupportRequest = (next: NextFunction, body: AdminSupportRequest): boolean => {
    const { content, priority, subject, status, user_id } = body

    if (!content || content.length === 0) {
        throw new AppError('Support message is required', 400)
    } else if (!priority) {
        throw new AppError('Priority is required', 400)
    } else if (!status) {
        throw new AppError('Status is required', 400)
    } else if (!user_id) {
        throw new AppError(' Ticked id is required', 400)
    }
    else if (!subject) {
        throw new AppError('Support subject is required', 400)
    }

    return true
}
