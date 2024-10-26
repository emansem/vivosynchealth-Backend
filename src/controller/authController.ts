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
import { doctor } from '../model/doctorModel';
import { sendResentPasswordEmail } from '../emails/resetPasswordEmail';

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

//validate all patients inputs
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
        const existenEmail = await matchUserType.findOne({ where: { email } });
        if (existenEmail) {
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
export const savePatientData = async (body: UserTypes, password: string, next: NextFunction) => {
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
export const saveDoctorData = async (body: UserTypes, password: string, next: NextFunction) => {
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
            gender,

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
        const generatedToken = generateJwt(userData.id)
        const emailToken = userData.email_verify_token
        const veryLink = `http://localhost:5740/verify/${emailToken}`
        try {
            await sendVerificationEmail(userData.first_name, userData.email, veryLink)
        } catch (error) {
            throw new AppError('Error sending email', 400)
        }
        res.status(201).json({
            status: 'success',
            message: "Account created successfully",
            jwt: generatedToken,
            data: { userData }
        })

    } catch (error) {
        next(error);
    }

}

//Forgot password controller
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    let findUser
    try {
        if (!email) {
            throw new AppError("Email address is required", 400)
        }
        findUser = await patient.findOne({ where: { email: email } });
        if (!findUser) {
            findUser = await doctor.findOne({ where: { email: email } })
        }
        if (findUser === null) {
            throw new AppError("Invalid email adress or user not found", 400)
        }
        const token = generateEmailToken()
        const resetLink = `http://localhost:5740/verify-email?token=${token}`
        await sendResentPasswordEmail(findUser.dataValues.first_name, findUser.dataValues.email, resetLink);
        await savePasswordResetToken(token, findUser.dataValues.id, findUser.dataValues.user_type)
        res.status(200).json({
            status: "success",
            message: "A password reset link has been sent to your email"
        })

    } catch (error) {
        next(error)
    }


}

//insert the user password reset token in to the database 
const savePasswordResetToken = async (token: string, id: number, user_type: string) => {
    try {
        const userMatch = user_type === "patient" ? patient : doctor;
        await userMatch.update({ password_reset_token: token, token_expires_in: Date.now() + 20 * 60 * 1000 }, { where: { id: id } });
    } catch (error) {

    }
}
//Reset password controller
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let findUser;
        const token = req.query.token;
        const { password, confirmPassword } = req.body;
        if (!token) {
            throw new AppError('Invalid token or token has expired', 400);
        }
        findUser = await patient.findOne({ where: { password_reset_token: token } });
        if (!findUser) {
            findUser = await doctor.findOne({ where: { password_reset_token: token } });
        }
        if (!findUser) {
            throw new AppError('Invalid token or token has expired', 400);
        }
        if (!password || !confirmPassword) {
            throw new AppError("Please fill all the fields", 400);
        } else if (password !== confirmPassword) {
            throw new AppError("Password do not match", 400);
        }

    } catch (error) {

    }
}