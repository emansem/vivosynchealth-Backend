import { NextFunction, Request, Response } from "express"
import { AppError } from "../../../middleware/errors";
import { transaction } from "../../../model/transactionModel";
import findUser from "../../../helper/findUser";
import { USER_TYPES } from "../../../constant";

/**
 * A controller function to get all transactions data
 * Returns  paginated data to the client
 */

export const getAllTransactions = async (req: Request, res: Response, next: NextFunction) => {
    // Get doctor ID from authenticated user
    const user_id = (req as any).user;

    try {
        // Extract and validate pagination parameters
        const { page = 1, limit = 10 } = req.query as any;
        const pageNUmber = parseInt(page)
        const limitResult = parseInt(limit);

        // Validate page number
        if (page <= 0 || isNaN(page)) {
            throw new AppError("Please provid a valid page number", 400);
        }

        // Calculate pagination offset
        const offset = (pageNUmber - 1) * limitResult;
        const totalTransactions = await transaction.count();

        console.log("the next number", offset, pageNUmber, limit)

        // Validate page number against total available pages
        const validateResponse = await validateTotalPages(totalTransactions, res, pageNUmber, limitResult, next);
        if (!validateResponse) return;

        const user = await findUser(user_id, 'user_id', next, 'No user found', 404);
        const isUserMatched = user?.dataValues.user_type === USER_TYPES.PATIENT ? "patient_id" : "doctor_id"


        // Fetch paginated transaction data
        const transactionData = await transaction.findAll({
            where: { [isUserMatched]: user_id },
            offset,
            limit: limitResult,
            attributes: {
                exclude: ['patient_id', "doctor_id"]
            }
        })

        // Handle case when no transactions found
        if (!transactionData || transactionData.length <= 0) {
            res.status(200).json({
                status: 'success',
                message: "No transactions found",
                data: {
                    transactions: []
                }
            })
        }

        // Return successful response with pagination metadata
        res.status(200).json({
            totalItems: totalTransactions,
            totalPages: Math.ceil(totalTransactions / limitResult),
            currentPage: page,
            data: {
                transactions: transactionData
            }
        })
    } catch (error) {
        next(error)
    }
}

/**
 * Validates if requested page number exists in available data
 * Returns empty result if page number exceeds total pages
 */
const validateTotalPages = async (totalTransactions: number, res: Response, page: number, limit: number, next: NextFunction) => {
    try {
        const totalPages = Math.ceil(totalTransactions / limit)
        if (totalPages < page) {
            res.status(200).json({
                totalItems: totalTransactions,
                totalPages,
                currentPage: page,
                data: {
                    transactions: []
                }
            })
        }
        return true;
    } catch (error) {
        next(error)
        return false;
    }
}