import { NextFunction, Request, Response } from "express";
import findUser from "../../helper/findUser";
import { subscription } from "../../model/subscriptionModel";
import { Model } from "sequelize";
import { SubscriptionData } from "../../types";
import { SENSITIVE_USER_FIELDS, USER_TYPES } from "../../constant";
import { doctor } from "../../model/doctorModel";
import { patient } from "../../model/patientsModel";

/**
 * Controller to retrieve active subscriptions for a user (either doctor or patient)
 * Handles fetching subscription data and related user information while excluding sensitive fields
 * 
 * @param req - Express Request object containing user ID in req.user
 * @param res - Express Response object for sending back subscription data
 * @param next - Express NextFunction for error handling
 */
export const getActiveSubscription = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Extract user ID from request object (set by authentication middleware)
    const user_id = (req as any).user;

    try {
        // Find the user and verify they exist in the system
        const user = await findUser(
            user_id,
            'user_id',
            next,
            "User account not found",
            404
        );

        // Determine if we're looking for patient_id or doctor_id based on user type
        const USER_TYPE = user?.dataValues.user_type === USER_TYPES.PATIENT
            ? 'patient_id'
            : 'doctor_id';

        // Set the model to query based on user type (if user is patient, we query doctors and vice versa)
        const matchUser = user?.dataValues.user_type === USER_TYPES.PATIENT
            ? doctor
            : patient;

        // Fetch all subscriptions for the current user
        const subscriptionData: Model<SubscriptionData, SubscriptionData>[] =
            await subscription.findAll({
                where: { [USER_TYPE]: user_id }
            });

        // Filter to get only active subscriptions
        const activeSubscription = subscriptionData.filter(
            item => item.dataValues.subscription_status === 'active'
        );

        // Return early if no active subscriptions found
        if (activeSubscription.length <= 0) {
            res.status(200).json({
                status: "success",
                message: "No active Subscription found",
                data: {
                    subscription: []
                }
            });
            return
        }

        // Determine the field name for the other user's ID in the subscription
        const otherUserType = user?.dataValues.user_type === USER_TYPES.PATIENT
            ? 'doctor_id'
            : 'patient_id';

        // Extract IDs of the other users from subscription data
        const userIds = subscriptionData.map(
            item => item.dataValues[otherUserType]
        );

        // Fetch user details for all related users, excluding sensitive fields
        const users = await matchUser.findAll({
            where: { user_id: userIds },
            attributes: {
                exclude: SENSITIVE_USER_FIELDS
            }
        });

        res.status(200).json({
            status: 'success',
            message: "Successfully retrieved active subscription users",
            data: {
                users: users
            }
        })

    } catch (error) {
        // Pass any errors to the error handling middleware
        next(error);
    }
};