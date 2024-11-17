import { Response, Request, NextFunction } from "express"
import { AppError } from "../../middleware/errors"
import { comparePassword } from "../../utils/password";
import findUser from "../../helper/findUser";
import { patient } from "../../model/patientsModel";
import { doctor } from "../../model/doctorModel";
import { getUserCurrentLocation } from "../../services/getUserLocation";

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {


    try {
        const userLocation = await getUserCurrentLocation();
        const userIp = userLocation.geoplugin_request;
        const { email, password } = req.body
        if (!email || !password) throw new AppError("All fields are required", 400)
        //Find the user in the database by email
        const user = await findUser(email, "email", next, "Invalid email adress or user not found", 400) as any

        if (! await comparePassword(password, user?.dataValues.password)) {
            throw new AppError('Invalid email or password ', 404);
        }
        else if (!user.dataValues.email_verified) {
            throw new AppError('Please verify your email adress ', 400)
        }
        const userType = user.dataValues.user_type === "patient" ? patient : doctor;


        await userType.update(
            {

                last_login_ip: userIp,
            },
            {
                where: {
                    user_id: user.dataValues.user_id
                }
            }
        )

        // const {password, ...user} = findUser;
        res.status(200).json({
            status: "success",
            message: 'User successfully login',
            user_type: user.dataValues.user_type,


        })
    } catch (error) {
        next(error)
    }
}