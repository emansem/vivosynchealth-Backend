import { NextFunction, Request, Response } from 'express';
import { hashPassword } from '../../utils/password';
import { AppError } from '../../middleware/errors';
import { sendVerificationEmail } from '../../emails/email';
import { generateEmailToken } from '../../helper/emailToken';
import { patient } from '../../model/patientsModel';
import { doctor } from '../../model/doctorModel';
import { generateDoctorId, generatePatientId } from '../../helper/generateUserId';
import { generateJwt } from '../../utils/jwt';
import { RegisterField } from '../../types';

//validate all user inputs
const validateUserInputs = async (body: RegisterField, next: NextFunction): Promise<boolean> => {
    try {
        const { email, password, name, phone, user_type } = body;

        if (!email || !password || !name || !phone || !user_type) {
            throw new AppError('All fields are required', 400);
        }
        return true

    } catch (error) {
        next(error)
        return false
    }
}
//A function to create user account
export const createAccount = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const { email, password, user_type } = req.body as RegisterField
        //validate the user inputs
        const isValidInputs = await validateUserInputs(req.body, next);
        if (!isValidInputs) {
            throw new AppError("Invalid input data", 400)
        }
        const matchUserType = user_type === "patient" ? patient : doctor
        const existingEmail = await matchUserType.findOne({ where: { email } });

        //Check if the user email is already registered
        if (existingEmail) {
            throw new AppError('This email have been used already', 400);
        }
        //Get the user data and send the user email verification
        const savedUserData = await saveUserData(req.body, password, next)
        await getUserData(res, savedUserData, next)

    } catch (error: any) {
        next(error)
    }
}

//A fuction save user data in the database 
const saveUserData = async (body: RegisterField, password: string, next: NextFunction) => {
    const { email, name, phone, gender, user_type } = body
    const matchUserType = user_type === "patient" ? patient : doctor;
    const saveUserId = user_type === "patient" ? generatePatientId() : generateDoctorId();

    try {
        const passwordToSave = await hashPassword(password) as string;
        const tokenExpireTime = Date.now() + 20 * 20 * 60 * 1000;
        const userData = matchUserType.create({
            name: name,
            phone_number: phone,
            email: email,
            password: passwordToSave,
            email_verify_token: generateEmailToken(),
            gender,
            user_type: user_type,
            token_expires_in: tokenExpireTime,
            user_id: saveUserId

        })

        return (await userData).toJSON();
    } catch (error) {
        next(error)
    }


}

//Get and send the back a response to the user, also send the user a email verification link
const getUserData = async (res: Response, userData: any, next: NextFunction) => {
    try {
        const emailvericationToken = userData.email_verify_token
        const emailVerificationLink = `http://localhost:3000/auth/verify-email-success?token=${emailvericationToken}`
        try {
            await sendVerificationEmail(userData.name, userData.email, emailVerificationLink)
        } catch (error) {
            throw new AppError('Error sending email', 400)
        }

        res.status(201).json({
            status: 'success',
            message: "Account created successfully, please verify your email",
            jwt: generateJwt(userData.user_id)

        })

    } catch (error) {
        next(error);
    }

}