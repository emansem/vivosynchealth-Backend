import { NextFunction, Request, Response } from "express"
import { AppError } from "../../../middleware/errors";
import { subscription } from "../../../model/subscriptionModel";

/**
 * Retrieves paginated subscription data for a doctor
 * Handles query parameters for pagination and returns formatted response
 */
export const getAllDoctorSubscriptionData = async (req: Request, res: Response, next: NextFunction) => {
    // Get doctor ID from authenticated user
    const doctor_id = (req as any).user;

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
        const totalSubscription = await subscription.count();

        // Validate page number against total available pages
        const validateResponse = await validateTotalPages(totalSubscription, res, pageNUmber, limitResult, next);
        if (!validateResponse) return;

        // Fetch paginated subscription data
        const subscriptionData = await subscription.findAll({
            where: { doctor_id: doctor_id },
            offset,
            limit: limitResult
        })

        // Handle case when no subscriptions found
        if (!subscriptionData || subscriptionData.length <= 0) {
            res.status(200).json({
                status: 'success',
                message: "No subscription found",
                data: {
                    subscription: []
                }
            })
        }

        // Return successful response with pagination metadata
        res.status(200).json({
            totalItems: subscriptionData.length,
            totalPages: Math.ceil(totalSubscription / limitResult),
            currentPage: page,
            data: {
                subscription: subscriptionData
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
const validateTotalPages = async (totalDoctors: number, res: Response, page: number, limit: number, next: NextFunction) => {
    try {
        const totalPages = Math.ceil(totalDoctors / limit)
        if (totalPages < page) {
            res.status(200).json({
                totalItems: totalDoctors,
                totalPages,
                currentPage: page,
                data: {
                    subscription: []
                }
            })
        }
        return true;
    } catch (error) {
        next(error)
        return false;
    }
}

// const filterDoctors = (state: string, country: string, specialization: string, city: string) => {
//     const filter: any = {};
//     if (country) filter.country = country;
//     if (state) filter.state = state;
//     if (specialization) filter.specialization = specialization
//     if (city) filter.city = city;

//     return filter;
// }
