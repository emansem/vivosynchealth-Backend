
import { Response, Request, NextFunction } from "express"
import { patient } from "../model/patientsModel";
import { AppError } from "../middleware/errors";
import { doctor } from "../model/doctorModel";

export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.params;
    try {
        const userData = await findUserData(token, next)
        if (userData !== null) {
            const user_type = userData?.dataValues.user_type
            const id = userData?.dataValues.id;
            await updateUserData(id, user_type, res);
        } else {
            throw new AppError("Invlide token or token has expired", 400);
        }
    }

    catch (error) {
        next(error)
    }

}

//find user from the database
const findUserData = async (token: string, next: NextFunction) => {
    let findUser = await patient.findOne({ where: { email_verify_token: token } });
    try {
        if (!findUser) {
            findUser = await doctor.findOne({ where: { email_verify_token: token } });
            console.log(findUser);
        } else if (!findUser) {
            throw new AppError("Invlide token or token has expired", 404);
        }
        else if (findUser.dataValues.token_expires_in <= Date.now()) {
            throw new AppError('Token has expired, request a new token', 400)
        }
        return findUser
    } catch (error) {
        next(error);
    }
}

//update email verified row, set email token to null, and expires time to null
const updateUserData = async (id: Number, userType: string, res: Response) => {
    try {
        const user_type = userType === "patient" ? patient : doctor
        const updatedData = await user_type.update({ email_verified: true, token_expires_in: null, email_verify_token: null }, { where: { id } })
        console.log(updatedData)
        res.status(200).json({
            message: "Email has been successfully verified",
            // patient: updatedData

        })
    } catch (error) {
        console.log(error);
    }
}