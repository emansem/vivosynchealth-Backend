import { NextFunction, Request, Response } from 'express';
import { hashPassword } from '../../utils/password';
import { generateJwt } from '../../utils/jwt';
import { AppError } from '../../middleware/errors';
import { patient } from '../../model/patientsModel';
import { doctor } from '../../model/doctorModel';


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
        const typeOfUser = findUser.dataValues.user_type === "patient" ? patient : doctor;
        const user_id = findUser.dataValues.id;
        await typeOfUser.update(
            {
                password: await hashPassword(password),
                password_reset_token: null,
                token_expires_in: null
            },
            { where: { id: user_id } })
        //send back a response here
        res.status(200).json({
            status: "success",
            message: "Password has been reseted successfully, please login now",
            token: generateJwt(user_id)
        })
    } catch (error) {
        next(error)
    }
}