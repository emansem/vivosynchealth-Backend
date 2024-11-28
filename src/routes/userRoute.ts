import express from "express"
import { getAllDoctors, getDoctorById } from "../controller/userController/patient/getDoctor";
import { protectedRoutes } from "../middleware/protection";
import { createAPlan, deleteDoctorPlan, getAllDoctorPlans, getDoctorPlan, updatePlan } from "../controller/userController/doctor/subscriptionPlan";
import { createWithdrawalAccount, deleteDoctorWithdrawalAccount, getDoctorWithdrawalAccount, updateWithdrawalAccount } from "../controller/userController/withdrawalAccount";
import { getAllDoctorSubscriptionPlan, getDoctorSubscriptionPlan } from "../controller/userController/patient/getDoctorSubscriptionPlan";
import { getUser } from "../controller/userController/getUser";
import { updateOnboardData } from "../controller/userController/doctor/updateOnboardData";
import { authoriseUserAccess } from "../middleware/authorization";
import { USER_TYPES } from "../constant";
import updateDoctorProfile, { getDoctorData } from "../controller/userController/doctor/updateProfile";

export const doctorRoute = express.Router();
export const patientRoute = express.Router();
export const userRoute = express.Router();
userRoute.get("/user", protectedRoutes, getUser)
//doctor route
doctorRoute
    .get("/withdrawal/account", protectedRoutes, authoriseUserAccess(USER_TYPES.DOCTOR), getDoctorWithdrawalAccount)
    .get('/plans', protectedRoutes, authoriseUserAccess(USER_TYPES.DOCTOR), getAllDoctorPlans)

    .put('/onboard', protectedRoutes, authoriseUserAccess(USER_TYPES.DOCTOR), updateOnboardData)
    .put('/update-profile', protectedRoutes, authoriseUserAccess(USER_TYPES.DOCTOR), updateDoctorProfile)
    .post('/create-plan', protectedRoutes, authoriseUserAccess(USER_TYPES.DOCTOR), createAPlan)
    .put('/plan/:id', protectedRoutes, updatePlan)
    .get("/plan/:id", protectedRoutes, authoriseUserAccess(USER_TYPES.DOCTOR), getDoctorPlan)
    .get('/plans', protectedRoutes, authoriseUserAccess(USER_TYPES.DOCTOR), getAllDoctorPlans)
    .delete("/plan/:id", protectedRoutes, deleteDoctorPlan)
    .post("/withdrawal/account/create", protectedRoutes, createWithdrawalAccount)
    .put('/withdrawal/account/update', protectedRoutes, updateWithdrawalAccount)
    .delete("/withdrawal-account/delete", protectedRoutes, deleteDoctorWithdrawalAccount)
    .get('/details', protectedRoutes, authoriseUserAccess(USER_TYPES.DOCTOR), getDoctorData)




patientRoute
    .get("/plans/:doctorId", protectedRoutes, authoriseUserAccess(USER_TYPES.PATIENT), getAllDoctorSubscriptionPlan)
    .get('/find-doctor', protectedRoutes, authoriseUserAccess(USER_TYPES.PATIENT), getAllDoctors)
    .get('/find-doctor/:doctorId', protectedRoutes, authoriseUserAccess(USER_TYPES.PATIENT), getDoctorById)