import { NextFunction, Request, Response } from "express-serve-static-core";
import { AppError } from "../../../middleware/errors";
import { subscription } from "../../../model/subscriptionModel";
import { plan } from "../../../model/subscriptionPlan";


export const getDoctorSubscriptionPlan = async (req: Request, res: Response, next: NextFunction) => {
    try {
        //Check if the patient have a subscription with the doctor
        const doctor_id = req.params.doctorId
        const patient_id = (req as any).user;
        console.log(doctor_id, patient_id)
        if (!doctor_id) throw new AppError("Please enter a valid Doctor id", 400);
        const doctorSubscription = await subscription.findOne({
            where:
            {
                patient_id: patient_id,
                doctor_id: doctor_id
            }
        });
        if (!doctorSubscription) {
            res.status(200).json({
                message: "Patient donot have a subscription with this  doctor",
                data: []
            })
        }

        //Check What type of plan they have with doctor if, they have a subscription and you will have to upgrade the plan instead

        res.status(200).json({
            status: "success",
            data: doctorSubscription
        })


    } catch (error) {
        next(error);
    }
}

export const getAllDoctorSubscriptionPlan = async (req: Request, res: Response, next: NextFunction) => {
    const doctor_id = req.params.doctorId;
    console.log("Doctor id extracted from the param", doctor_id);

    try {
        const planDetails = await plan.findAll({
            where: { doctor_id }
        });

        console.log("Raw plan details:", JSON.stringify(planDetails, null, 2));

        if (!planDetails || planDetails.length === 0) {
            res.status(404).json({
                status: "error",
                message: "No plans found for this doctor",
                data: {
                    plans: []
                }
            });
        }

        // Safely format each plan
        const formatPlan = planDetails.map(planDetail => {
            // Extract the raw object
            const rawPlan = planDetail.toJSON();

            try {
                // Parse plan_features if it exists and is a string
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


        res.status(200).json({
            result: formatPlan.length,
            status: "success",
            message: "Plan details successfully retrieved",
            data: {
                plans: formatPlan
            }
        });
    } catch (error) {
        console.error("Error in getAllDoctorPlans:", error);
        next(error);
    }
};

//Get  the doctor plan by id
export const getSubscriptionPlan = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = parseInt(req.params.id);

        if (!id) throw new AppError("Please provid a valid id", 400);
        const totalPlans = await plan.count();

        const planDetails = await plan.findOne({ where: { id: id } });

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