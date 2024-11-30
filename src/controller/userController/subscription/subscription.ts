// Import required types from Express
import { NextFunction, Request, Response } from "express";
// Import subscription model
import { subscription } from "../../../model/subscriptionModel";
import { AppError } from "../../../middleware/errors";
import { plan } from "../../../model/subscriptionPlan";
import { where } from "sequelize";

// Controller to handle patient subscription data retrieval
export const getPatientSubscriptionData = async (req: Request, res: Response, next: NextFunction) => {
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

// Controller to handle patient current subscription  data retrieval
export const getSubscriptionWithPlans = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const subscriptionId = req.params.subscriptionId;

    try {
        // Validate subscription ID
        if (!subscriptionId) {
            throw new AppError("Please provide a valid subscription id", 400);
        }

        // Fetch current subscription
        const currentSubscription = await subscription.findByPk(subscriptionId);
        if (!currentSubscription) {
            throw new AppError("No subscription found", 404);
        }

        // Get all subscription plans for the doctor
        const doctorId = currentSubscription.dataValues.doctor_id;
        const subscriptionPlans = await plan.findAll({
            where: { doctor_id: doctorId }
        });

        if (subscriptionPlans.length <= 0) {
            throw new AppError("No subscription plans were found", 400);
        }

        // Process and format plan features
        const formatPlan = subscriptionPlans.map(planDetail => {
            const rawPlan = planDetail.toJSON();

            try {
                // Handle plan features that might be stored as JSON string
                const features = typeof rawPlan.plan_features === 'string'
                    ? JSON.parse(rawPlan.plan_features)
                    : rawPlan.plan_features || [];

                return {
                    ...rawPlan,
                    plan_features: features
                };
            } catch (parseError) {
                console.error("Error parsing plan features:", parseError);
                return {
                    ...rawPlan,
                    plan_features: []
                };
            }
        });

        // Send successful response
        res.status(200).json({
            status: "success",
            message: "Successfully retrieved Subscription data",
            data: {
                current_subscription: currentSubscription,
                subscription_plans: formatPlan
            }
        });
    } catch (error) {
        next(error)
    }
};

// Controller to handle patient current subscription  data retrieval
export const updateSubscriptionStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const subscriptionId = req.params.subscriptionId;
    const { status } = req.body

    try {
        // Validate subscription ID
        if (!subscriptionId) {
            throw new AppError("Please provide a valid subscription id", 400);
        }

        // Fetch current subscription
        const subscriptionStatus = await subscription.update(
            { subscription_status: status },
            { where: { id: subscriptionId } });

        if (!subscriptionStatus) {
            throw new AppError("Couldnot update your subscription status", 404);
        }
        res.status(200).json({
            status: 'success',
            message: "Successfully update subscription status"
        })

    } catch (error) {
        next(error)
    }
};
