import { NextFunction, Request, Response } from "express"
import { AppError } from "../../middleware/errors";
import { plan } from "../../model/subscriptionPlan";
import { subscription } from "../../model/subscriptionModel";
import { generateEmailToken } from "../../helper/emailToken";
import { paymentHistory } from "../../model/payment-historyModel";
import { Model } from "sequelize";
import { SubscriptionData, SubscriptionPlanDataType } from "../../types";
import { doctor } from "../../model/doctorModel";
import makePaymentWithBalance from "../../utils/payWithBalance";
import { createNewTransaction } from "../userController/transaction/createNewTransaction";



// Main function to handle payment collection
export const payWithAccountBalance = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const patient_id = (req as any).user;
        const planId = parseInt(req.params.planId);
        const { payment_method } = req.body

        // Get plan details from database
        const planData: Model<SubscriptionPlanDataType, SubscriptionPlanDataType> | null = await plan.findByPk(planId);
        if (!planData) throw new AppError("Please provide a valid plan ID", 400);

        const doctorId = planData.dataValues.doctor_id as string

        // Calculate final amount after discount
        // const doctorId = planData.dataValues.doctor_id as string
        const planAmount = planData.dataValues.amount;
        const plan_type = planData.dataValues.plan_type
        const totalAmount = planAmount - Number(planData.dataValues.discount_percentage * 0.1)

        //Find the doctor and save his name in the subscription table
        const doctorDetails = await doctor.findOne({ where: { user_id: doctorId } })


        const existingSubscription = await subscription.findOne({
            where: { doctor_id: doctorId, patient_id }
        });

        if (existingSubscription) {
            // Destructure relevant data from existing subscription
            const {
                plan_id: existingPlanId,
                expire_date,
                id,
                subscription_status
            } = existingSubscription.dataValues as SubscriptionData;

            // Get current date for comparison
            const currentDate = new Date();
            // Check if subscription is expired by comparing dates
            const isExpired = new Date(expire_date) <= currentDate;

            // Case 1: User tries to subscribe to the same plan they already have
            // Conditions: Same plan ID + Plan not expired + Subscription not cancelled
            if (existingPlanId === planId && !isExpired && subscription_status !== "cancelled") {
                throw new AppError(
                    "You're already subscribed to this plan. Please choose a different plan to upgrade.",
                    400
                );
            }

            // Case 2: User tries to subscribe to a different plan while current one is active
            // Conditions: Plan not expired + Subscription not cancelled
            if (!isExpired && subscription_status !== "cancelled") {
                throw new AppError(
                    `Your current plan is active until ${new Date(expire_date).toLocaleDateString()}.
       Please wait for it to expire before upgrading.`,
                    400
                );
            }

            // Attempt to process payment using user's balance
            const makePayment = await makePaymentWithBalance(next, totalAmount, patient_id);
            if (!makePayment) throw new AppError("Insufficient balance, Please refill your account", 400);

            // If payment successful, upgrade the subscription
            const upgradedData = await upgradeSubscription(
                id,
                planId,
                totalAmount,
                next,
                payment_method,
                plan_type,
                patient_id,
                doctorId
            );

            // Handle failed upgrade
            if (!upgradedData) {
                throw new AppError("Failed to upgrade subscription", 400);
            }

            // Return success response with upgraded subscription data
            res.status(200).json({
                status: "success",
                message: "Payment successful. Subscription activated",
                data: {
                    subscription: upgradedData
                }
            });
            return;
        }

        // Process the payment
        const makePayment = await makePaymentWithBalance(next, totalAmount, patient_id)
        if (!makePayment) throw new AppError("Insufficient balance, Please refill your account", 400)

        // Create subscription if payment successful
        const subscriptionData = await createSubscription(doctorId, patient_id, planId, planAmount, next, payment_method, plan_type, doctorDetails?.dataValues.name);

        if (subscriptionData) {
            res.status(201).json({
                status: "success",
                message: "Payment successful. Subscription activated",
                data: {
                    subscription: subscriptionData
                }
            })
        }
    } catch (error) {
        next(error)
    }
}

// Create new subscription in database
const createSubscription = async (doctor_id: string, patient_id: string, plan_id: number, amount: number, next: NextFunction, payment_method: string, plan_type: string, doctor_name: string) => {
    try {
        const payId = generateEmailToken().slice(0, 10);

        const saveSubscription = await subscription.create({
            patient_id,
            doctor_id,
            plan_id,
            amount,
            plan_type,
            doctor_name,
            payment_id: payId,
            subscription_status: "active",
            expire_date: Date.now() + 2 * 60 * 1000 // 30 days
        })

        if (!saveSubscription) throw new AppError("Failed to save subscription data", 400);

        const paymentId = saveSubscription.dataValues.patient_id as string

        await createNewTransaction(next, { patient_id, doctor_id, type: "subscription", amount: amount })

        await doctor.increment("total_balance", { by: amount, where: { user_id: doctor_id } })

        return saveSubscription;
    } catch (error) {
        next(error);
    }
}


// Create new subscription in database
const upgradeSubscription = async (subscriptionId: number, plan_id: number, amount: number, next: NextFunction, payment_method: string, plan_type: string, patient_id: string, doctor_id: string,) => {
    try {
        const payId = generateEmailToken().slice(0, 10);
        await subscription.update({
            plan_id,
            amount,
            plan_type,
            payment_id: payId,
            subscription_status: "active",
            expire_date: Date.now() + 2 * 60 * 1000
        }, { where: { id: subscriptionId } })

        const upgradedData = await subscription.findByPk(subscriptionId);

        await createNewTransaction(next, { patient_id, doctor_id, type: "subscription", amount: amount })

        await doctor.increment("total_balance", { by: amount, where: { user_id: doctor_id } })

        return upgradedData;
    } catch (error) {
        next(error);
    }
}