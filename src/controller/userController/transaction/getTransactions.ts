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
    // Get user id ID from authenticated user
    const user_id = (req as any).user;

    try {
        // Extract and validate pagination parameters
        const { page = 1, limit = 10, type } = req.query as any;
        const pageNUmber = parseInt(page)
        const limitResult = parseInt(limit);

        // Validate page number
        if (page <= 0 || isNaN(page)) {
            throw new AppError("Please provid a valid page number", 400);
        }

        // Calculate pagination offset
        const offset = (pageNUmber - 1) * limitResult;
        const totalTransactions = await transaction.count();

        console.log("the next number", req.query as any)

        // Validate page number against total available pages
        const validateResponse = await validateTotalPages(totalTransactions, res, pageNUmber, limitResult, next);
        if (!validateResponse) return;

        const user = await findUser(user_id, 'user_id', next, 'No user found', 404);

        const whereClause = buildFilterCriteria(user_id, user?.dataValues.user_type, type)

        // Fetch paginated transaction data
        const { count, rows: transactionData } = await transaction.findAndCountAll({
            where: whereClause,
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
            totalItems: count,
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

/**
 * Filtering Helpers
 */
interface FilterOptions {
    type?: string
}
const buildFilterCriteria = (user_id: string, userType: string, type?: string) => {
    const userMatch = userType === USER_TYPES.DOCTOR ? 'doctor_id' : 'patient_id'
    const filterOptions: FilterOptions = {};
    const whereClause: any = { [userMatch]: user_id };

    // Handle status filter
    if (type && type !== 'all') {
        filterOptions.type = type;
        whereClause.type = filterOptions.type.toLowerCase();
    }

    // // Handle plan type filter
    // if (planType && planType !== 'all') {
    //     filterOptions.plan_type = planType;
    //     whereClause.plan_type = planType.toLowerCase();
    // }

    return whereClause;
}