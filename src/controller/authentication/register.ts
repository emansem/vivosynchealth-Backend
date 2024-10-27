import { NextFunction, Request, Response } from 'express';
import { hashPassword } from '../../utils/password';
import { generateUserId } from '../../utils/userId';
import { generateJwt } from '../../utils/jwt';
import { AppError } from '../../middleware/errors';
import { sendVerificationEmail } from '../../emails/email';
import { generateEmailToken } from '../../helper/emailToken';
import { patient } from '../../model/patientsModel';
import { doctor } from '../../model/doctorModel';


//Create a new patient controller

interface UserTypes {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    phone: string
    gender: string;
    user_type: string
}

//validate all user inputs
const validateUserInputs = async (body: UserTypes, next: NextFunction): Promise<boolean> => {
    try {
        const { email, password, confirmPassword, firstName, phone, user_type } = body;

        if (!email || !password || !confirmPassword || !firstName || !phone || !user_type) {
            throw new AppError('All fields are required', 400);
        } else if (confirmPassword !== password) {
            throw new AppError('Password donot match', 400);
        }
        return true

    } catch (error) {
        next(error)
        return false
    }
}

export const createAccount = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const { email, password, user_type } = req.body as UserTypes
        //validate the user inputs
        const isValidInputs = await validateUserInputs(req.body, next);
        if (!isValidInputs) {
            throw new AppError("Invlid input data", 400)
        }
        const matchUserType = user_type === "patient" ? patient : doctor
        const existingEmail = await matchUserType.findOne({ where: { email } });
        if (existingEmail) {
            throw new AppError('This email have been used already', 400);
        } else if (user_type === "patient") {
            const patientData = await savePatientData(req.body, password, next)
            await getUserData(res, patientData, next)
        } else if (user_type === 'doctor') {
            const doctorData = await saveDoctorData(req.body, password, next);
            await getUserData(res, doctorData, next)
        }


    } catch (error: any) {
        next(error)
    }
}

//fuction save patients data in the database 
const savePatientData = async (body: UserTypes, password: string, next: NextFunction) => {
    const { email, firstName, lastName, phone, gender } = body
    try {
        const passToSave = await hashPassword(password) as string;
        const emailTokenEXpires = Date.now() + 20 * 60 * 1000;
        const patientData = patient.create({
            first_name: firstName,
            last_name: lastName,
            phone_number: phone,
            email: email,
            password: passToSave,
            email_verify_token: generateEmailToken(),
            gender,
            user_type: 'patient',
            token_expires_in: emailTokenEXpires,
            patient_id: generateUserId(),

        })

        return (await patientData).toJSON();
    } catch (error) {
        next(error)
    }


}

//fuction save doctorData data in the database 
const saveDoctorData = async (body: UserTypes, password: string, next: NextFunction) => {
    const { email, firstName, lastName, phone, gender } = body
    try {
        const passToSave = await hashPassword(password) as string;
        const emailTokenEXpires = Date.now() + 20 * 60 * 1000;
        const doctorData = doctor.create({
            first_name: firstName,
            last_name: lastName,
            phone_number: phone,
            email: email,
            password: passToSave,
            email_verify_token: generateEmailToken(),
            gender: gender,
            user_type: 'doctor',
            token_expires_in: emailTokenEXpires,
            doctor_id: generateUserId()

        })

        return (await doctorData).toJSON();
    } catch (error) {
        next(error)
    }


}

//Get the patient data back when is inserted 
const getUserData = async (res: Response, userData: any, next: NextFunction) => {
    try {
        const emailToken = userData.email_verify_token
        const veryLink = `http://localhost:5740/verify-email?token=${emailToken}`
        try {
            await sendVerificationEmail(userData.first_name, userData.email, veryLink)
        } catch (error) {
            throw new AppError('Error sending email', 400)
        }
        res.status(201).json({
            status: 'success',
            message: "Account created successfully, please verify your email to login",

        })

    } catch (error) {
        next(error);
    }

}