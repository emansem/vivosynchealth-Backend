import express from "express"
import { getAllDoctors, getDoctorById } from "../controller/userController/doctor/getDoctor";
import { protectedRoutes } from "../middleware/protection";
import { createAPlan, deleteDoctorPlan, getAllDoctorPlans, getDoctorPlan, updatePlan } from "../controller/userController/doctor/subscriptionPlan";
import { createWithdrawalAccount, deleteDoctorWithdrawalAccount, getDoctorWithdrawalAccount, updateWithdrawalAccount } from "../controller/userController/withdrawalAccount";
import { getDoctorSubscriptionPlan } from "../controller/userController/patient/getDoctorSubscriptionPlan";
import { getUser } from "../controller/userController/getUser";
import { updateOnboardData } from "../controller/userController/doctor/updateOnboardData";
import { authoriseUserAccess } from "../middleware/authorization";
import { USER_TYPES } from "../constant";

export const doctorRoute = express.Router();
export const patientRoute = express.Router();
export const userRoute = express.Router();
userRoute.get("/user", protectedRoutes, getUser)
//doctor route
doctorRoute
    .get('/', protectedRoutes, getAllDoctors)
    .get('/:id', protectedRoutes, getDoctorById)
    .put('/onboard', protectedRoutes, authoriseUserAccess(USER_TYPES.DOCTOR), updateOnboardData)
    .post('/create-plan', protectedRoutes, authoriseUserAccess(USER_TYPES.DOCTOR), createAPlan)
    .put('/plan/:id', protectedRoutes, updatePlan)
    .get("/plan/:id", protectedRoutes, getDoctorPlan)
    .get('/plans/:doctor_id', protectedRoutes, getAllDoctorPlans)
    .delete("/plan/:id", protectedRoutes, deleteDoctorPlan)
    .post("/withdrawal-account/create", protectedRoutes, createWithdrawalAccount)
    .put('/withdrawal-account/update', protectedRoutes, updateWithdrawalAccount)
    .get("/withdrawal-account/account", protectedRoutes, getDoctorWithdrawalAccount)
    .delete("/withdrawal-account/delete", protectedRoutes, deleteDoctorWithdrawalAccount);



patientRoute
    .get("/doctor-plan/:doctorId", protectedRoutes, getDoctorSubscriptionPlan);