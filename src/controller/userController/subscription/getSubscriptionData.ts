// Import required types from Express
import { NextFunction, Request, Response } from "express";
// Import subscription model
import { subscription } from "../../../model/subscriptionModel";

// Controller to handle patient subscription data retrieval
const getPatientSubscriptionData = async (req: Request, res: Response, next: NextFunction) => {
    // Get patient ID from authenticated user
    const patient_id = (req as any).user;

    try {
        // Fetch all subscriptions for the patient from database
        const subscriptionData = await subscription.findAll({
            where: { patient_id }
        });

        // If no subscriptions found, return 404
        if (subscriptionData.length <= 0) {
            res.status(404).json({
                status: "Error",
                message: "No subscription data found",
                data: {
                    subscription: []
                }
            });
            return;
        }
        console.log(subscriptionData)

        // Return successful response with subscription data
        res.status(200).json({
            status: "success",
            message: "Successfully retrieved subscription",
            data: {
                subscription: subscriptionData
            }
        });
    } catch (error) {
        next(error)
    }
};


export default getPatientSubscriptionData;