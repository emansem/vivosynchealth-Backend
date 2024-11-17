import { NextFunction } from "express";
import { AppError } from "../middleware/errors";
import { doctor } from "../model/doctorModel";
import { patient } from "../model/patientsModel";

const findUser = async (searchValue: string | number, searchKey: string, next: NextFunction, errorMessage: string, errorCode: number) => {
    try {
        // const isValidSearchKey = ["id", "email", "phone", "email_verify_token", "password_reset_token, user_id"];
        // if (!isValidSearchKey.includes(searchKey)) throw new AppError('Invalid search key', 400);

        if (!searchValue) {
            throw new AppError(errorMessage, errorCode)
        }
        let findUserData = await patient.findOne({ where: { [searchKey]: searchValue }, attributes: { exclude: ["email_verify_token", "token_expires_in"] } });
        if (!findUserData) {
            findUserData = await doctor.findOne({ where: { [searchKey]: searchValue }, attributes: { exclude: ["email_verify_token", "token_expires_in"] } });
        }
        if (findUserData === null) {
            throw new AppError(`${errorMessage}`, errorCode)
        }
        return findUserData;
    } catch (error) {
        next(error)
    }
}

export default findUser;