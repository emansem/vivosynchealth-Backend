import { NextFunction, Request, Response } from "express"
import { doctor } from "../../../model/doctorModel";
import { subscription } from "../../../model/subscriptionModel";
import { SENSITIVE_USER_FIELDS } from "../../../constant";
import { Model } from "sequelize";
import { SubscriptionData } from "../../../types";


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

        res.status(200).json({
            status: "success",
            message: "Successfully retrieved all doctor details",
            data: { details }
        })



    } catch (error) {
        next(error)
    }
}