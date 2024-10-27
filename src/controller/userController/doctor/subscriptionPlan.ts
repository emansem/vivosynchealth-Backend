import { NextFunction, Response, Request } from "express";
import { plan } from "../../../model/subscriptionPlan";
import { AppError } from "../../../middleware/errors";

export const createAPlan = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const doctorId = (req as any).user;
        const { amount, name, plan_items } = req.body;
        if (!amount || !name) {
            throw new AppError("Amount and name are required", 400);
        }

        //THE PLAN DETAILS IN THE DATABASE
        const savedDetails = await plan.create({
            name,
            amount,
            doctor_id: doctorId,
            plan_items: JSON.stringify(plan_items)
        })
        res.status(201).json({
            status: "success",
            message: "Plan successfully created",
            data: {
                plan: savedDetails
            }
        })
    } catch (error) {
        next(error)
    }

}

//update the plan
export const updatePlan = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const updatedDetails: any = {};
        const { coupon_id, name, amount, plan_items, status } = req.body;
        const id = parseInt(req.params.id);
        if (!id || isNaN(id)) throw new AppError("Please provid a valid id", 400)
        if (coupon_id) updatedDetails.coupon_id = coupon_id;
        if (name) updatedDetails.name = name;
        if (amount) updatedDetails.amount = amount;
        if (plan_items) updatedDetails.plan_items = JSON.stringify(plan_items);

        //update the plan details
        await plan.update(updatedDetails, { where: { id: id } },);
        //find the updated plan record in the database and send to the client
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
        const id = parseInt(req.params.doctor_id);
        if (!id || isNaN(id)) throw new AppError("Please provid a valid id", 400);

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