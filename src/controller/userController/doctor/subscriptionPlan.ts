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
            planAmount, planName, planFeatures,
            planType, planDuration, isRefundEnabled,
            discountPercentage, refundDays
        } = req.body as SubscriptionPlanDataType;

        // Basic validation
        if (!planAmount || !planName) {
            throw new AppError("Amount and name are required", 400);
        }

        // Check for existing plans of same type
        const findPlanType = await plan.findAll({ where: { doctor_id } });
        if (!findPlanType) return;

        const isPlanTypeDuplicated = findPlanType.filter(item =>
            item.dataValues.plan_type === planType
        );

        // Prevent duplicate plan types
        if (isPlanTypeDuplicated.length > 0) {
            const capitalizedPlanType = planType.charAt(0).toUpperCase() + planType.slice(1);
            throw new AppError(
                `${capitalizedPlanType} plan type already exist, choose another one`,
                400
            );
        }

        // Create new plan
        const savedDetails = await plan.create({
            name: planName,
            amount: planAmount,
            doctor_id,
            isRefundEnabled,
            plan_type: planType,
            discount_percentage: discountPercentage,
            refund_period: refundDays,
            plan_duration: planDuration,
            plan_status: "active",
            plan_features: JSON.stringify(planFeatures)
        });

        // Send success response
        res.status(201).json({
            status: "success",
            message: "Plan successfully created",
            data: { plan: savedDetails }
        });

    } catch (error) {
        next(error);
    }
};

//update the plan
export const updatePlan = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const updatedDetails: any = {};
        const { coupon_id, name, amount, plan_items, status } = req.body;
        const id = parseInt(req.params.id);
        //To update the plan  record, you have to check if  field to be updated is prvided if not donot update the row 
        if (!id || isNaN(id)) throw new AppError("Please provid a valid id", 400)
        if (coupon_id) updatedDetails.coupon_id = coupon_id;
        if (name) updatedDetails.name = name;
        if (amount) updatedDetails.amount = amount;
        if (plan_items) updatedDetails.plan_items = JSON.stringify(plan_items);
        const findPlan = await plan.findByPk(id);
        if (!findPlan) throw new AppError("No plan found", 400);

        //Update the plan details
        await plan.update(updatedDetails, { where: { id: id } },);

        //find the plan  to be updated in the database and send a successfull response to the client
        const updatedPlanRecord = await plan.findOne({ where: { id: id } });
        res.status(200).json({
            status: "success",
            message: "Plan updated successfully",
            data: {
                plan: updatedPlanRecord
            }
        })
    } catch (error) {
        next(error)
    }
}

//Get  the doctor plan by id
export const getDoctorPlan = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = parseInt(req.params.id);
        if (!id || isNaN(id)) throw new AppError("Please provid a valid id", 400);
        const totalPlans = await plan.count();
        if (id > totalPlans) throw new AppError("Please provid a valid id", 400);
        const planDetails = await plan.findOne({ where: { id: id } });
        res.status(200).json({
            status: "succcess",
            data: {
                plan: planDetails
            }
        })
    } catch (error) {
        next(error)
    }
}

export const getAllDoctorPlans = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.doctor_id
        if (!id || id) throw new AppError("Please provid a valid id", 400);

        const planDetails = await plan.findAll({ where: { doctor_id: id } });
        res.status(200).json({
            status: "succcess",
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
        if (!id || isNaN(id)) throw new AppError("Please provid a valid id", 400);
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