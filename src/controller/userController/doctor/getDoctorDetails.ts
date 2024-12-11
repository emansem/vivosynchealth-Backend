import { NextFunction, Request, Response } from "express"
import { doctor } from "../../../model/doctorModel";
import { subscription } from "../../../model/subscriptionModel";
import { SENSITIVE_USER_FIELDS } from "../../../constant";
import { Model, Op, Sequelize } from "sequelize";
import { SubscriptionData } from "../../../types";
import { getWeekRange } from "../../../helper/date";


export const getAllDoctorDetails = async (req: Request, res: Response, next: NextFunction) => {
    const doctor_id = (req as any).user;

    try {
        const doctorDetails = await doctor.findOne({
            where: { user_id: doctor_id }, attributes: {
                exclude: SENSITIVE_USER_FIELDS
            }
        });
        const subscriptionDetails: Model<SubscriptionData, SubscriptionData>[] = await subscription.findAll({ where: { doctor_id } })
        const expiredSubscription = subscriptionDetails.filter(subscription => subscription.dataValues.subscription_status === "expired");
        const activeSubscription = subscriptionDetails.filter(subscription => subscription.dataValues.subscription_status === "active");
        const cancelSubscription = subscriptionDetails.filter(subscription => subscription.dataValues.subscription_status === "cancelled");

        const inactiveSubscription = expiredSubscription.length + cancelSubscription.length

        const details = {
            activeSubscription: activeSubscription.length,
            inactiveSubscription,
            totalBalance: doctorDetails?.dataValues.total_balance,
            doctorName: doctorDetails?.dataValues.name,
            subscription: subscriptionDetails,
            totalPatient: subscriptionDetails.length
        }
        await getYearlySubscriptionRange(doctor_id, next)

        res.status(200).json({
            status: "success",
            message: "Successfully retrieved all doctor details",
            data: { details }
        })



    } catch (error) {
        next(error)
    }
}

// Define our types first
interface SubscriptionDataValue {
    month: string;
    count: string | number;
    dataValues: {
        month: string;
        count: string | number;
    };
}

// Type for the month data structure
type MonthDataType = Record<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12, number>;

// Type for processed subscription data
interface ProcessedSubscriptionData {
    month: string;
    count: number;
}

// Type for yearly statistics
interface YearlyStats {
    active: ProcessedSubscriptionData[];
    inactive: ProcessedSubscriptionData[];
    comparison?: {
        active: ProcessedSubscriptionData[];
        inactive: ProcessedSubscriptionData[];
    };
}

const getYearlySubscriptionRange = async (doctor_id: string, next: NextFunction) => {
    try {
        const currentYear = new Date().getFullYear();

        // Adjust the dates to ensure we capture the full year
        const startOfYear = new Date(currentYear, 0, 1);    // January 1st
        startOfYear.setHours(0, 0, 0, 0);  // Start at beginning of day

        const endOfYear = new Date(currentYear, 11, 31);    // December 31st
        endOfYear.setHours(23, 59, 59, 999);  // End at end of day

        // Add debug logging
        console.log("Checking subscription data:", {
            doctorId: doctor_id,
            year: currentYear,
            dateRange: {
                start: startOfYear.toISOString(),
                end: endOfYear.toISOString()
            }
        });

        // First, let's check if we have any subscriptions at all for this doctor
        const totalSubscriptions = await subscription.count({
            where: {
                doctor_id
            }
        });

        console.log(`Total subscriptions found for doctor: ${totalSubscriptions}`);

        // Now check subscription statuses
        const statusCounts = await subscription.findAll({
            where: { doctor_id },
            attributes: [
                'subscription_status',
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
            ],
            group: ['subscription_status']
        });

        console.log("Subscription status distribution:",
            statusCounts.map(s => ({
                status: s.getDataValue('subscription_status'),
                count: s.getDataValue('count')
            }))
        );

        // Proceed with your existing queries but with explicit timezone handling
        const activeSubscriptions = await subscription.findAll({
            where: {
                doctor_id,
                created_at: {
                    [Op.between]: [startOfYear, endOfYear]
                },
                subscription_status: 'active'
            },
            attributes: [
                [Sequelize.fn('MONTH', Sequelize.col('created_at')), 'month'],
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
            ],
            group: [Sequelize.fn('MONTH', Sequelize.col('created_at'))],
            order: [[Sequelize.fn('MONTH', Sequelize.col('created_at')), 'ASC']]
        });

        // Log the raw active subscription data
        console.log("Raw active subscription data:",
            activeSubscriptions.map(s => s.dataValues)
        );

        // Rest of your code remains the same...
    } catch (error: any) {
        console.error('Error with detailed context:', {
            error: error.message,
            stack: error.stack
        });
        next(error);
        return {
            active: [],
            inactive: []
        };
    }
};

