import { NextFunction, Request, Response } from "express"
import { AppError } from "../../middleware/errors";
import { plan } from "../../model/subscriptionPlan";
import * as Mesomb from '@hachther/mesomb';
import dotenv from "dotenv"
import { subscription } from "../../model/subscriptionModel";
import { generateEmailToken } from "../../helper/emailToken";
import { paymentHistory } from "../../model/payment-historyModel";
import { Model } from "sequelize";
import { SubscriptionPlanDataType } from "../../types";
import { doctor } from "../../model/doctorModel";

dotenv.config()
const pay = Mesomb as any

// Main function to handle payment collection
export const collectLocalPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const patient_id = (req as any).user;
        const { phone_number, payment_method } = req.body;
        const number = parseInt(phone_number)
        const planId = parseInt(req.params.planId);

        // Check if required fields are present
        if (!number || !payment_method) throw new AppError("Please all fields are required, or provide a valid phone number", 400);

        // Check for existing subscription
        const checkPlan = await subscription.findOne({ where: { plan_id: planId } });
        if (checkPlan) throw new AppError("Active subscription found for this plan. Please select a different plan to upgrade.", 400)

        // Get plan details from database
        const planData: Model<SubscriptionPlanDataType, SubscriptionPlanDataType> | null = await plan.findByPk(planId);
        if (!planData) throw new AppError("Please provide a valid plan ID", 400);

        // Calculate final amount after discount
        const doctorId = planData.dataValues.doctor_id as string
        const planAmount = planData.dataValues.amount;
        const plan_type = planData.dataValues.plan_type
        const totalAmount = planAmount - Number(planData.dataValues.discount_percentage * 0.1)
        //Find the doctor and save his name in the subscription table
        const doctorDetails = await doctor.findOne({ where: { user_id: doctorId } })

        // Process the payment
        const payment = await makeDeposit(next, totalAmount, phone_number, payment_method)
        if (!payment) throw new AppError("Payment processing failed. Please try again", 400);

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
            expire_date: Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
        })

        if (!saveSubscription) throw new AppError("Failed to save subscription data", 400);

        const paymentId = saveSubscription.dataValues.patient_id as string
        await createPaymentHistory(paymentId, patient_id, doctor_id, amount, next, payment_method)
        return saveSubscription;
    } catch (error) {
        next(error);
    }
}

// Save payment history record
const createPaymentHistory = async (payment_id: string, patient_id: string, doctor_id: string, amount: number, next: NextFunction, payment_method: string) => {
    try {
        const savedPaymentHistory = await paymentHistory.create({
            doctor_id,
            patient_id,
            amount,
            payment_id,
            payment_method
        })
        if (!savedPaymentHistory) throw new AppError("Failed to save payment history", 400);
    } catch (error) {
        next(error)
    }
}

// Process payment through payment gateway
const makeDeposit = async (next: NextFunction, amount: number, phone_number: number, payment_method: string) => {
    try {
        const payment = new pay.PaymentOperation({
            applicationKey: process.env.APPLICATION_KEY,
            accessKey: process.env.Access_Key,
            secretKey: process.env.Secret_Key
        });

        const response = await payment.makeCollect({
            amount: amount,
            service: payment_method,
            payer: phone_number,
            nonce: pay.RandomGenerator.nonce()
        });

        if (!response.isOperationSuccess() || !response.isTransactionSuccess()) {
            throw new AppError("Payment processing failed. Please try again", 400);
        }
        return true

    } catch (error) {
        next(error)
        return false
    }
}