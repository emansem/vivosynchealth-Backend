import { NextFunction, Request, Response } from "express";
import findUser from "../../helper/findUser";
import { AppError } from "../../middleware/errors";
import { SENSITIVE_USER_FIELDS, USER_TYPES } from "../../constant";
import { doctor } from "../../model/doctorModel";
import { patient } from "../../model/patientsModel";

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
    const user_id = (req as any).user;
    console.log('user account id', user_id)
    try {
        const user = await findUser(user_id, 'user_id', next, "User not found", 404)
        const userType = user?.dataValues.user_type === USER_TYPES.DOCTOR ? doctor : patient
        const userData = await userType.findOne({
            where: { user_id },
            attributes: {
                exclude: SENSITIVE_USER_FIELDS
            }
        });


        if (!userData) {
            throw new AppError("User account not found", 400);
        } else {
            res.status(200).json({
                status: "success",
                message: "User successfull retreived",
                data: {
                    user: userData
                }

            })
        }
    } catch (error) {
        console.log("Error finding user", error)
    }
}