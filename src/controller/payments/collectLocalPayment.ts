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
dotenv.config()
const pay = Mesomb as any


export const collectLocalPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const patient_id = (req as any).user;
        const { phone_number, payment_method } = req.body;
        const number = parseInt(phone_number)
        const planId = parseInt(req.params.planId);
        if (!number || !payment_method) throw new AppError("Please all fields are , or a valid  phone number", 400);

        //Check if the patient have purchase this plan already if yes then send back error response
        const checkPlan = await subscription.findOne({ where: { plan_id: planId } });
        console.log("We found the plan", checkPlan)
        if (checkPlan) throw new AppError("You have subscribed to this plan already, Please upgrade to a different plan", 400)

        //Find the plan in the database and collect the name of the plan and the doctor the doctor id;

        const planData: Model<SubscriptionPlanDataType, SubscriptionPlanDataType> | null = await plan.findByPk(planId);
        if (!planData) throw new AppError("Please provid a valid plan id", 400);

        //Get the doctor id and plan amount
        const doctorId = planData.dataValues.doctor_id as string

        //we will charge the patient later for using our services
        const planAmount = planData.dataValues.amount;
        console.log("Plan Data", planData)
        const totalAmount = planAmount - Number(planData.dataValues.discount_percentage * 0.1)

        const payment = await makeDeposit(next, totalAmount, phone_number, payment_method)
        if (!payment) throw new AppError("Your payment has failed please try again", 400);
        // //Send a response back to the user when the subscription is successfull
        const subscriptionData = await createSubscription(doctorId, patient_id, planId, planAmount, next, payment_method);
        if (subscriptionData) {
            res.status(201).json({
                status: "success",
                message: "Your payment was successfull, you have subscribe to this doctor",
                data: {
                    subscription: subscriptionData
                }
            })
        }
    } catch (error) {
        next(error)
    }
}

//Create the patient and doctor a subscription 
const createSubscription = async (doctor_id: string, patient_id: string, plan_id: number, amount: number, next: NextFunction, payment_method: string) => {
    try {
        const payId = generateEmailToken().slice(0, 10);
        console.log(payId);
        const saveSubscription = await subscription.create(
            {
                patient_id,
                doctor_id,
                plan_id,
                payment_id: payId,
                subscription_status: "active",
                expire_date: Date.now() + 30 * 24 * 60 * 60 * 1000

            }
        )
        if (!saveSubscription) throw new AppError("Error saving your data in the database", 400);
        const paymentId = saveSubscription.dataValues.patient_id as string
        await createPaymentHistory(paymentId, patient_id, doctor_id, amount, next, payment_method)
        return saveSubscription;
    } catch (error) {
        next(error);
    }
}

//create doctor and the patient a payment history
const createPaymentHistory = async (payment_id: string, patient_id: string, doctor_id: string, amount: number, next: NextFunction, payment_method: string) => {
    try {
        const savedPaymentHistory = await paymentHistory.create({
            doctor_id,
            patient_id,
            amount,
            payment_id,
            payment_method

        }
        )
        if (!savedPaymentHistory) throw new AppError("An error occour saving your data", 400);
    } catch (error) {
        next(error)
    }
}

//Collect the payment
const makeDeposit = async (next: NextFunction, amount: number, phone_number: number, payment_method: string) => {
    try {
        const payment = new pay.PaymentOperation(
            {
                applicationKey: process.env.APPLICATION_KEY,
                accessKey: process.env.Access_Key,
                secretKey: process.env.Secret_Key
            }
        );
        const response = await payment.makeCollect({ amount: amount, service: payment_method, payer: phone_number, nonce: pay.RandomGenerator.nonce() });

        if (!response.isOperationSuccess() || !response.isTransactionSuccess()) {
            throw new AppError("Your payment has failed please try again", 400);
        }
        return true

    } catch (error) {
        next(error)
        return false
    }
}