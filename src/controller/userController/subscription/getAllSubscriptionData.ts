import { NextFunction, Request, Response } from "express"
import { AppError } from "../../../middleware/errors";
import { subscription } from "../../../model/subscriptionModel";
import { USER_TYPES } from "../../../constant";
import { calculatePaginationParams } from "../../../utils/calculatePaginatedOffset";

/**
 * Types and Interfaces
 */
interface FilterOptions {
    subscription_status?: string,
    plan_type?: string
}

/**
 * Main Controller: Handles subscription data retrieval with filtering and pagination
 * @param req Express Request object containing query parameters
 * @param res Express Response object
 * @param next NextFunction for error handling
 */
export const getAllSubscriptionData = async (req: Request, res: Response, next: NextFunction) => {
    const user_id = (req as any).user;

    try {
        // Extract query parameters with defaults
        const {
            page = 1,
            limit = 10,
            status = 'All',
            planType = 'all',
            userType
        } = req.query as any;

        console.log('request query', req.query as any)

        // --- VALIDATION SECTION ---
        await validatePaginationParams(page);

        // --- FILTERING SECTION ---
        const whereClause = buildFilterCriteria(user_id, userType, status, planType);

        // --- PAGINATION SECTION ---
        const paginationData = calculatePaginationParams(page, limit);

        // Get total count for pagination
        const totalSubscription = await subscription.count();

        // Validate page number against total available pages
        const validateResponse = await validateTotalPages(
            totalSubscription,
            res,
            paginationData.pageNumber,
            paginationData.limitResult,
            next
        );
        if (!validateResponse) return;

        console.log('subscription status', status)

        // --- DATA FETCHING SECTION ---
        const { count, rows: subscriptionData } = await subscription.findAndCountAll({
            where: whereClause,
            offset: paginationData.offset,
            limit: paginationData.limitResult,
            order: [['created_at', 'DESC']]
        });

        // --- RESPONSE HANDLING SECTION ---
        await handleSubscriptionResponse(
            res,
            subscriptionData,
            count,
            paginationData.pageNumber,
            paginationData.limitResult,
            page
        );

    } catch (error) {
        next(error);
    }
}

/**
 * Validation Helpers
 */
const validatePaginationParams = async (page: number) => {
    if (page <= 0 || isNaN(page)) {
        throw new AppError("Please provide a valid page number", 400);
    }
}

/**
 * Filtering Helpers
 */
const buildFilterCriteria = (user_id: string, userType: string, status?: string, planType?: string) => {
    const userMatch = userType === USER_TYPES.DOCTOR ? 'doctor_id' : 'patient_id'
    const filterOptions: FilterOptions = {};
    const whereClause: any = { [userMatch]: user_id };

    // Handle status filter
    if (status && status !== 'All') {
        filterOptions.subscription_status = status;
        whereClause.subscription_status = status.toLowerCase();
    }

    // Handle plan type filter
    if (planType && planType !== 'all') {
        filterOptions.plan_type = planType;
        whereClause.plan_type = planType.toLowerCase();
    }

    return whereClause;
}



/**
 * Response Handlers
 */
const handleSubscriptionResponse = async (
    res: Response,
    subscriptionData: any[],
    totalItems: number,
    pageNumber: number,
    limitResult: number,
    page: number
) => {
    // Handle empty results
    if (!subscriptionData || subscriptionData.length <= 0) {
        res.status(200).json({
            status: 'success',
            message: "No subscription found",
            data: {
                subscription: []
            }
        });
        return
    }

    // Return successful response with pagination metadata
    res.status(200).json({
        totalItems: totalItems,
        totalPages: Math.ceil(totalItems / limitResult),
        currentPage: page,
        data: {
            subscription: subscriptionData
        }
    });
}

/**
 * Page Validation Helper
 * Checks if requested page number is within available range
 */
const validateTotalPages = async (
    totalDoctors: number,
    res: Response,
    page: number,
    limit: number,
    next: NextFunction
) => {
    try {
        const totalPages = Math.ceil(totalDoctors / limit);
        if (totalPages < page) {
            res.status(200).json({
                totalItems: totalDoctors,
                totalPages,
                currentPage: page,
                data: {
                    subscription: []
                }
            });
        }
        return true;
    } catch (error) {
        next(error);
        return false;
    }
}