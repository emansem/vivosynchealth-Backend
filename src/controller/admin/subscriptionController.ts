import { NextFunction, Request, Response } from "express";
import { subscription } from "../../model/subscriptionModel";
import { Model } from "sequelize";
import { SubscriptionData } from "../../types";
import { calculateMontlyDates, getMonthDate } from "../../helper/date";
import { calculatePerecentageDff } from "../../helper/helps";
import { calculateSubscriptionMonthlyDff } from "./dashboardController";
import { calculatePaginationParams } from "../../utils/calculatePaginatedOffset";
interface SubscriptionRequestQuery {
    page: number,
    limit: number,
    status: string,
    plan_type: string
}
export const adminSubscriptionStatsAndData = async (req: Request, res: Response, next: NextFunction) => {
    const { thisMonth, lastMonth } = calculateMontlyDates()
    const { page = 1, limit = 10, plan_type, status } = req.query as unknown as SubscriptionRequestQuery
    try {
        const subscriptionData: Model<SubscriptionData, SubscriptionData>[] = await subscription.findAll({ order: [['created_at', 'DESC']] });
        const totalSubscriptionRevenue = subscriptionData.reduce((total, subscription) => total + subscription.dataValues.amount, 0);
        const thisMonthSubscription = subscriptionData
            .filter(subscription => getMonthDate(subscription.dataValues.created_at) === thisMonth)
            .reduce((total, thisMonth) => total + thisMonth.dataValues.amount, 0)

        const lastMonthSubscription = subscriptionData
            .filter(subscription => getMonthDate(subscription.dataValues.created_at) === lastMonth)
            .reduce((total, lastMonth) => total + lastMonth.dataValues.amount, 0)

        const totalSubscriptionDff = thisMonthSubscription - lastMonthSubscription
        const { percentage } = calculatePerecentageDff(totalSubscriptionDff, lastMonthSubscription, thisMonthSubscription)

        const subscriptionsByType = await calculateSubscriptionMonthlyDff(next)
        const activeSubscriptions = subscriptionsByType?.activeSubscriptions || 0;
        const totalActiveSubDff = subscriptionsByType?.totalSubscriptionsDff || 0;
        const totalExpiredSub = subscriptionsByType?.expiredSubscriptions || 0;
        const totalCancelledSub = subscriptionsByType?.expiredSubscriptions || 0

        const filterResult = await filterSubscription(limit, page, status, plan_type, next)

        res.status(200).json({
            status: "success",
            data: {
                totalSubscriptionDff,
                subscriptionData: filterResult?.desktopViewSubscription,
                mobileSubscription: filterResult?.mobileSubscriptionDetails,
                totalResult: filterResult?.totalResult,
                totalSubscriptionRevenue,
                activeSubscriptions,
                totalExpiredSub,
                totalCancelledSub,
                totalActiveSubDff
            }
        })


    } catch (error) {
        next(error)
    }
}

const filterSubscription = async (limit: number, page: number, status: string, planType: string, next: NextFunction) => {
    try {
        const { offset, limitResult } = calculatePaginationParams(page, limit)
        let whereClause: any = {}
        if (status) {
            whereClause.subscription_status = status

        }

        if (planType) {
            whereClause.plan_type = planType

        }
        let subscriptionQuery: any = {
            offset, limit: limitResult, order: [['created_at', 'DESC']]

        }
        let mobileSubscriptionQuery: any = { order: [['created_at', 'DESC']] }

        if (Object.keys(whereClause).length > 0) {
            subscriptionQuery.where = whereClause
            mobileSubscriptionQuery.where = whereClause
        }

        const mobileSubscriptionDetails = await subscription.findAll(mobileSubscriptionQuery)
        const { count: totalResult, rows: desktopViewSubscription } = await subscription.findAndCountAll(subscriptionQuery)
        return { totalResult, desktopViewSubscription, mobileSubscriptionDetails }

    } catch (error) {
        next(error)
    }

}
