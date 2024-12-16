import { NextFunction, Request, Response } from "express"
import { subscription } from "../../../model/subscriptionModel";
import { patient } from "../../../model/patientsModel";
import { SENSITIVE_USER_FIELDS } from "../../../constant";
import { transaction } from "../../../model/transactionModel";

export const getAllPatientProfileData = async (req: Request, res: Response, next: NextFunction) => {
    const patient_id = (req as any).user;
    try {
        const { count, rows: subscriptionData } = await subscription.findAndCountAll({ where: { patient_id } })
        const userDetails = await patient.findOne({
            where: { user_id: patient_id }, attributes: {
                exclude: SENSITIVE_USER_FIELDS
            }
        })
        const activeSubscription = subscriptionData.filter(subscription => subscription.dataValues.subscription_status === 'active');
        const expiredSubscription = subscriptionData.filter(subscription => subscription.dataValues.subscription_status === 'expired');

        const recentTransactions = await transaction.findAll({ where: { patient_id }, limit: 5, order: [['created_at', 'DESC']] })

        res.status(200).json({
            status: 'success',
            data: {
                patient: userDetails,
                activeSubscription: activeSubscription.length,
                expiredSubscription: expiredSubscription.length,
                recentTransactions,
                totalSubscription: count
            }
        })

    } catch (error) {
        next(error)
    }
}