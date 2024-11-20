import { Response, Request, NextFunction } from "express"
import { AppError } from "../../middleware/errors"
import { comparePassword } from "../../utils/password";
import findUser from "../../helper/findUser";
import { patient } from "../../model/patientsModel";
import { doctor } from "../../model/doctorModel";
import { getUserCurrentLocation } from "../../services/getUserLocation";
import { generateJwt } from "../../utils/jwt";

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {


    try {
        const userLocation = await getUserCurrentLocation();
        const userIp = userLocation.geoplugin_request;
        const { email, password } = req.body
        if (!email || !password) throw new AppError("All fields are required", 400)
        if (!userIp) {
            return next(new AppError("Something went wrong, please try again", 400))
        }
        //Find the user in the database by email
        const user = await findUser(email, "email", next, "No account with this email", 400) as any

        if (! await comparePassword(password, user?.dataValues.password)) {
            throw new AppError('Invalid email or password ', 400);
        }
        else if (!user.dataValues.email_verified) {
            throw new AppError('Please verify your email adress ', 400)
        }
        const userType = user.dataValues.user_type === "patient" ? patient : doctor;
        const jwtToken = generateJwt(user?.dataValues.user_id);

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
            jwt: jwtToken
        })
    } catch (error) {
        next(error)
    }
}