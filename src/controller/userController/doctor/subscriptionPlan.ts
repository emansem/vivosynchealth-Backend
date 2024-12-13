import { NextFunction, Response, Request } from "express";
import { plan } from "../../../model/subscriptionPlan";
import { AppError } from "../../../middleware/errors";
import { SubscriptionPlanDataType } from "../../../types";



/**
* Controller to create a new subscription plan
* Validates input, checks duplicates, and saves plan details
*/
export const createAPlan = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const doctor_id = (req as any).user;

        // Extract plan details from request body
        const {
            amount, name, plan_features,
            plan_type, plan_duration, isRefundEnabled,
            discount_percentage, refund_period, plan_status
        } = req.body as SubscriptionPlanDataType;

        // Basic validation
        if (!amount || !name) {
            throw new AppError("Amount and name are required", 400);
        }

        // Check for existing plans of same type
        const findPlanType = await plan.findAll({ where: { doctor_id } });
        if (!findPlanType) return;

        const isPlanTypeDuplicated = findPlanType.filter(item =>
            item.dataValues.plan_type === plan_type
        );

        // Prevent duplicate plan types
        if (isPlanTypeDuplicated.length > 0) {
            const capitalizedPlanType = plan_type?.charAt(0).toUpperCase() + plan_type?.slice(1);
            throw new AppError(
                `${capitalizedPlanType} plan type already exist, choose another one`,
                400
            );
        }

        // Create new plan
        const savedDetails = await plan.create({
            name,
            amount,
            doctor_id,
            isRefundEnabled,
            plan_type,
            discount_percentage,
            refund_period,
            plan_duration,
            plan_status: plan_status,
            plan_features: JSON.stringify(plan_features)
        });

        // Send success response
        res.status(201).json({
            status: "success",
            message: "Plan successfully created",
            data: savedDetails
        });

    } catch (error) {
        next(error);
    }
};

//update the plan
export const updatePlan = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const doctor_id = (req as any).user;
        const { name, amount, plan_duration, plan_status, plan_features, isRefundEnabled, refund_period, discount_percentage, plan_type, } = req.body as SubscriptionPlanDataType

        const id = parseInt(req.params.id);

        if (!id) throw new AppError("Please provid a valid id", 400)
        console.log(req.body)

        // //Update the plan details
        await plan.update(
            {
                name,
                amount,
                doctor_id,
                isRefundEnabled,
                plan_type,
                discount_percentage,
                refund_period,
                plan_duration,
                plan_status,
                plan_features: JSON.stringify(plan_features)
            }
            , { where: { id: id } },);

        // Find the plan after updated in the database, and send a successfull response to the client
        const updatedPlanRecord = await plan.findOne({ where: { id: id } });
        if (updatedPlanRecord?.dataValues) {
            const formatedPlan = {
                ...updatedPlanRecord?.dataValues, plan_features: JSON.parse(updatedPlanRecord.dataValues.plan_features)
            }
            res.status(200).json({
                status: "success",
                message: "Plan updated successfully",
                data: {
                    plan: formatedPlan
                }
            })
        }

    } catch (error) {
        next(error)
    }
}

//Get  the doctor plan by id
export const getDoctorPlan = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = parseInt(req.params.id);
        console.log(id)
        if (!id || isNaN(id)) throw new AppError("Please provid a valid id", 400);
        const totalPlans = await plan.count();

        const planDetails = await plan.findOne({ where: { id: id } });
        console.log(planDetails, totalPlans)
        const planFeatures = JSON.parse(planDetails?.dataValues.plan_features);

        const planDetailsFormat = {
            ...planDetails?.dataValues, plan_features: planFeatures
        }
        res.status(200).json({
            status: "success",
            message: "Plan details retrieved successfully",
            data: {
                plan: planDetailsFormat
            }
        })
    } catch (error) {
        next(error)
    }
}

export const getAllDoctorPlans = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const doctor_id = (req as any).user;


        const planDetails = await plan.findAll({ where: { doctor_id } });
        if (!planDetails) return
        console.log(planDetails)
        res.status(200).json({
            result: planDetails.length,
            status: "success",
            message: "Plan details retrieved successfully retrived",
            data: {
                plans: planDetails
            }
        })
    } catch (error) {
        next(error)
    }
}

//Delete the doctor plan by id in the database 
export const deleteDoctorPlan = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = parseInt(req.params.id);
        if (!id) throw new AppError("Please provid a valid id", 400);
        const deletedItem = await plan.destroy({ where: { id: id } });
        //check if the id exist in the database 
        if (!deletedItem) throw new AppError("No plan found, please provid a valid id", 404);
        res.status(200).json({
            status: "success",
            message: "Plan successfully deleted",

        })
    } catch (error) {
        next(error)
    }
}