import { Response, Request, NextFunction } from "express"
import { AppError } from "../middleware/errors"
import { patient } from "../model/patientsModel";
import { comparePassword } from "../utils/password";
import { generateJwt } from "../utils/jwt";
export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body
    try {
        if (!email || !password) {
            throw new AppError("All fields are required", 400);
        }
        //find the user in  the database by email
        const findUser = await patient.findOne({ where: { email: email } });

        if (!findUser) {
            throw new AppError('Invalid email or password ', 404);
        }
        else if (! await comparePassword(password, findUser?.dataValues.password)) {
            throw new AppError('Invalid email or password ', 404);
        }
        else if (!findUser.dataValues.email_verified) {
            throw new AppError('Please verify your email to login ', 404)
        }
        res.status(200).json({
            status: "success",
            message: 'User successfully login',
            user_type: findUser.dataValues.user_type,
            jwt: generateJwt(findUser.dataValues.id),
            data: {
                user: findUser
            }
        })
    } catch (error) {
        next(error)
    }
}