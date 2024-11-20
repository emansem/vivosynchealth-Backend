import { NextFunction, Request, Response } from 'express';
import { hashPassword } from '../../utils/password';
import { generateJwt, verifyTOken } from '../../utils/jwt';
import { AppError } from '../../middleware/errors';
import { patient } from '../../model/patientsModel';
import { doctor } from '../../model/doctorModel';
import findUser from '../../helper/findUser';


//Reset password controller
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const token = req.query.token as string;
        const { password, confirm_password } = req.body;
        if (!token) {
            throw new AppError('Invalid token or token has expired', 400);
        }
        const user = await findUser(token, "password_reset_token", next, "Invalid token or token has expired", 400)
        if (!password || !confirm_password) {
            throw new AppError("Please fill all the fields", 400);
        } else if (password !== confirm_password) {
            throw new AppError("Password do not match", 400);
        }

        const typeOfUser = user?.dataValues.user_type === "patient" ? patient : doctor;
        const user_id = user?.dataValues.user_id;
        const jwtToken = generateJwt(user?.dataValues.user_id);
        const decordToken = verifyTOken(jwtToken);
        const { iat } = decordToken as string | number | any;

        await typeOfUser.update(
            {
                password: await hashPassword(password),
                password_reset_token: null,
                token_expires_in: null,
                password_updated_at: iat,

            },
            { where: { user_id } })
        //send back a response here
        res.status(200).json({
            status: "success",
            message: "Password has been reseted successfully, please login now",

        })
    } catch (error) {
        next(error)
    }
}