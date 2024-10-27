import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../middleware/errors';
import { generateEmailToken } from '../../helper/emailToken';
import { patient } from '../../model/patientsModel';
import { doctor } from '../../model/doctorModel';
import { sendResentPasswordEmail } from '../../emails/resetPasswordEmail';
import findUser from '../../helper/findUser';


//Forgot password controller
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body;
        if (!email) {
            throw new AppError("Email address is required", 400)
        }
        //Find the user in the database by email
        const user = await findUser(email, "email", next, "Invalid email adress or user not found", 400) as any

        const token = generateEmailToken()
        //Save the password reset token
        await savePasswordResetToken(token, user.dataValues.id, user.dataValues.user_type, next)
        const resetLink = `http://localhost:5740/verify-email?token=${token}`
        //send the user email link to verify his account
        await sendResentPasswordEmail(user.dataValues.first_name, user.dataValues.email, resetLink);

        res.status(200).json({
            status: "success",
            message: "A password reset link has been sent to your email"
        })

    } catch (error) {
        next(error)
    }
}

//insert the user password reset token in to the database 
const savePasswordResetToken = async (token: string, id: number, user_type: string, next: NextFunction) => {
    try {
        const userMatch = user_type === "patient" ? patient : doctor;
        await userMatch.update(
            {
                password_reset_token: token,
                token_expires_in: Date.now() + 20 * 60 * 1000
            },
            { where: { id: id } })

    } catch (error) {
        next(error)
    }
}


