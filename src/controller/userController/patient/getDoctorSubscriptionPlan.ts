import { NextFunction, Request, Response } from "express-serve-static-core";
import { AppError } from "../../../middleware/errors";
import { subscription } from "../../../model/subscriptionModel";


export const getDoctorSubscriptionPlan = async (req: Request, res: Response, next: NextFunction) => {
    try {
        //Check if the patient have a subscription with the doctor
        const doctor_id = parseInt(req.params.doctorId)
        const patient_id = (req as any).user;
        if (!doctor_id || isNaN(doctor_id)) throw new AppError("Please enter a valid Doctor id", 400);

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

    } catch (error) {
        next(error);
    }
}