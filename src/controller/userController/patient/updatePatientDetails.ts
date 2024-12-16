import { NextFunction, Request, Response } from "express"
import { patient } from "../../../model/patientsModel";
import { SENSITIVE_USER_FIELDS } from "../../../constant";

export interface UpdatePatientPersonalInfo {
    name: string,
    phone_number: string,
    country: string,
    state: string,
    city: string,
    profile_photo: string,
    date_of_birth: string,
    gender: "male" | "female" | 'custom' | '' | undefined
}
export const updatePatientPersonalDetails = async (req: Request, res: Response, next: NextFunction) => {
    const patient_id = (req as any).user;
    try {
        const { name, phone_number, country, city, gender, date_of_birth, profile_photo, state } = req.body as UpdatePatientPersonalInfo

        await patient.update({ name, phone_number, country, state, city, gender, date_of_birth, profile_photo }, { where: { user_id: patient_id } });

        const patientDetails = await patient.findOne({
            where: { user_id: patient_id }, attributes: {
                exclude: SENSITIVE_USER_FIELDS
            }
        })
        res.status(200).json({
            status: "success",
            message: "Successfully update personal information",
            data: {
                patient: patientDetails
            }
        })

    } catch (error) {
        next(error)
    }

}