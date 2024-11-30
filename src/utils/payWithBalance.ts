import { NextFunction } from "express";
import { AppError } from "../middleware/errors";
import { patient } from "../model/patientsModel";

const makePaymentWithBalance = async (next: NextFunction, totalAmount: number, patient_id: string): Promise<boolean> => {
    try {
        const patientData = await patient.findOne({ where: { user_id: patient_id } });
        const balance = patientData?.dataValues.balance;
        console.log("patient Data", patientData, balance, totalAmount, patient_id)
        if (balance && balance < totalAmount) {

            throw new AppError("Insuffient Balance please recharge your account", 400);
        }
        await patient.decrement("balance", { by: totalAmount, where: { user_id: patient_id } })
        return true
    } catch (error) {
        next(error)
        return false
    }
}

export default makePaymentWithBalance