import { NextFunction, Request, Response } from "express";
import { doctor } from "../../../model/doctorModel";
import { SENSITIVE_USER_FIELDS } from "../../../constant";


export interface UserDataTypes {
    // Personal & Professional Info
    name: string;
    email: string;
    phone_number: string;
    about: string;
    medical_license: string;
    profile_photo: string;
    years_of_experience: string;
    languages: string;
    speciality: string;
    // Location/Practice Info
    hospital_name: string;
    hospital_address: string;
    country: string;
    state: string;
    city: string;
    zip_code: string;
    working_days: string;
}

const updateDoctorProfile = async (req: Request, res: Response, next: NextFunction) => {
    const doctor_id = (req as any).user;
    try {
        //Extract the inputs value from the request body
        const {
            name, email, hospital_name,
            phone_number, about,
            medical_license, languages,
            hospital_address, zip_code,
            working_days, city, speciality,
            profile_photo, state, country,
            years_of_experience
        } = req.body as UserDataTypes

        //Update the doctor profile in the databasse
        await doctor.update(
            {
                name, email, hospital_name,
                phone_number, about,
                medical_license, languages,
                hospital_address, zip_code,
                working_days, city, speciality,
                profile_photo, state, country,
                years_of_experience
            },
            { where: { user_id: doctor_id } })

        //After a success update, fetch the doctor data and send a response back to the client
        const doctorData = await doctor.findOne({
            where: { user_id: doctor_id }, attributes: {
                exclude: SENSITIVE_USER_FIELDS
            }
        })
        if (!doctorData) return

        //Send back a successfull respone
        res.status(200).json({
            status: "success",
            message: "Your profile was successfully updated",
            data: {
                user: doctorData
            }
        })
    } catch (error) {
        next(error)
    }
}

export default updateDoctorProfile

