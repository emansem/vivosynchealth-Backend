import { NextFunction, Response, Request } from "express";
import { DoctorOnboardingData } from "../../../types";
import { AppError } from "../../../middleware/errors";
import { doctor } from "../../../model/doctorModel";

export const updateOnboardData = async (req: Request, res: Response, next: NextFunction
) => {

    try {
        const onboardData = req.body as DoctorOnboardingData;
        const doctorId = (req as any).user;

        const updateDoctor = await doctor.update(
            {
                about: onboardData.about,
                medical_license: onboardData.medical_license,
                speciality: onboardData.speciality,
                profile_photo: onboardData.profile_photo,
                city: onboardData.city,
                zip_code: onboardData.zip_code,
                working_days: onboardData.working_days,
                country: onboardData.country,
                years_of_experience: onboardData.years_of_experience,
                languages: onboardData.languages,
                hospital_address: onboardData.hospital_address,
                hospital_name: onboardData.hospital_name,
                state: onboardData.state,
                isProfileCompleted: true
            },
            { where: { user_id: doctorId } }
        );
        console.log(updateDoctor);
        res.status(200).json({
            status: "success",
            message: "user updated successfully",
            data: onboardData
        })
    } catch (error) {
        return next(new AppError('Something went wrong', 400))
    }


}