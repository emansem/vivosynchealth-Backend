import { NextFunction, Request, Response } from 'express';
import { hashPassword } from '../utils/password';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { generateUserId } from '../utils/userId';
import { generateJwt } from '../utils/jwt';
import { AppError } from '../middleware/errors';
import { executeQuery } from '../utils/excuteQuery';
import { sendVerificationEmail } from '../emails/email';
import { generateEmailToken } from '../helper/emailToken';
import { patient } from '../model/patientsModel';
import { json, where } from 'sequelize';

//Create a new patient controller

interface patientTypes {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    phone: string
    gender: string;
}

//validate all patients inputs
const validatePatientsInputs = async (body: patientTypes, next: NextFunction): Promise<boolean> => {
    try {
        const { email, password, confirmPassword, firstName, phone } = body;

        if (!email || !password || !confirmPassword || !firstName || !phone) {
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

export const createNewPatient = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const { email, password } = req.body as patientTypes
        //validate the patient inputs
        const isValidInputs = await validatePatientsInputs(req.body, next);
        if (!isValidInputs) {
            throw new AppError("Invlid input data", 400)
        }
        const existenEmail = await patient.findOne({ where: { email } });
        if (existenEmail) {
            throw new AppError('This email have been used already', 400);
        } else {
            const patientData = await savePatientData(req.body, password)
            // console.log(patientData)
            await getPatientData(res, patientData, next)

        }


    } catch (error: any) {
        next(error)
    }
}

//fuction save patients data in the database 
export const savePatientData = async (body: patientTypes, password: string) => {
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
            token_expires_in: emailTokenEXpires,
            patient_id: generateUserId()

        })

        return (await patientData).toJSON();
    } catch (error) {
        console.log('Error', error)
    }


}

//Get the patient data back when is inserted 
const getPatientData = async (res: Response, patientQueryData: any, next: NextFunction) => {
    try {
        const generatedToken = generateJwt(patientQueryData.id)
        const emailToken = patientQueryData.email_verify_token
        const veryLink = `http://localhost:5740/verify/${emailToken}`
        try {
            await sendVerificationEmail(patientQueryData.first_name, patientQueryData.email, veryLink)
        } catch (error) {
            throw new AppError('Error sending email', 400)
        }
        res.status(201).json({
            status: 'success',
            message: "Account created successfully",
            jwt: generatedToken,
            data: { patientQueryData }
        })

    } catch (error) {
        next(error);
    }

}

