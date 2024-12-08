import express from "express"
import { getAllDoctors, getDoctorById } from "../controller/userController/patient/getDoctor";
import { protectedRoutes } from "../middleware/protection";
import { createAPlan, deleteDoctorPlan, getAllDoctorPlans, getDoctorPlan, updatePlan } from "../controller/userController/doctor/subscriptionPlan";
import { createWithdrawalAccount, deleteDoctorWithdrawalAccount, getDoctorWithdrawalAccount, updateWithdrawalAccount } from "../controller/userController/withdrawalAccount";
import { getAllDoctorSubscriptionPlan, getDoctorSubscriptionPlan, getSubscriptionPlan } from "../controller/userController/patient/getDoctorSubscriptionPlan";
import { getUser } from "../controller/userController/getUser";
import { updateOnboardData } from "../controller/userController/doctor/updateOnboardData";
import { authoriseUserAccess } from "../middleware/authorization";
import { USER_TYPES } from "../constant";
import updateDoctorProfile, { getDoctorData } from "../controller/userController/doctor/updateProfile";
import { getPatientSubscriptionData, getSubscriptionWithPlans, updateSubscriptionStatus } from "../controller/userController/subscription/subscription";
import { getAllDoctorDetails } from "../controller/userController/doctor/getDoctorDetails";
import { getAllDoctorSubscriptionData } from "../controller/userController/doctor/getAllDoctorSubscription";
export const doctorRoute = express.Router();
export const patientRoute = express.Router();
export const userRoute = express.Router();

// User Routes
userRoute
    // GET - Fetch user details
    .get("/user", protectedRoutes, getUser);

// Doctor Routes
doctorRoute
    // GET Routes - Data Retrieval
    .get("/withdrawal/account", protectedRoutes, authoriseUserAccess(USER_TYPES.DOCTOR), getDoctorWithdrawalAccount)
    .get('/plans', protectedRoutes, authoriseUserAccess(USER_TYPES.DOCTOR), getAllDoctorPlans) // Note: Duplicate route
    .get("/plan/:id", protectedRoutes, authoriseUserAccess(USER_TYPES.DOCTOR), getDoctorPlan)
    .get('/details', protectedRoutes, authoriseUserAccess(USER_TYPES.DOCTOR), getDoctorData)
    .get('/details/all', protectedRoutes, authoriseUserAccess(USER_TYPES.DOCTOR), getAllDoctorDetails)
    .get('/all/subscription/details', protectedRoutes, authoriseUserAccess(USER_TYPES.DOCTOR), getAllDoctorSubscriptionData)

    // POST Routes - Create New Resources
    .post('/create-plan', protectedRoutes, authoriseUserAccess(USER_TYPES.DOCTOR), createAPlan)
    .post("/withdrawal/account/create", protectedRoutes, createWithdrawalAccount)

    // PUT Routes - Update Existing Resources
    .put('/onboard', protectedRoutes, authoriseUserAccess(USER_TYPES.DOCTOR), updateOnboardData)
    .put('/update-profile', protectedRoutes, authoriseUserAccess(USER_TYPES.DOCTOR), updateDoctorProfile)
    .put('/plan/:id', protectedRoutes, updatePlan)
    .put('/withdrawal/account/update', protectedRoutes, updateWithdrawalAccount)

    // DELETE Routes - Remove Resources
    .delete("/plan/:id", protectedRoutes, deleteDoctorPlan)
    .delete("/withdrawal-account/delete", protectedRoutes, deleteDoctorWithdrawalAccount);

// Patient Routes
patientRoute
    // GET Routes - Data Retrieval
    .get("/doctor/plans/:doctorId", protectedRoutes, authoriseUserAccess(USER_TYPES.PATIENT), getAllDoctorSubscriptionPlan)
    .get('/subscription/plan/:id', protectedRoutes, authoriseUserAccess(USER_TYPES.PATIENT), getSubscriptionPlan)
    .get('/find-doctor', protectedRoutes, authoriseUserAccess(USER_TYPES.PATIENT), getAllDoctors)
    .get('/subscription/patient', protectedRoutes, authoriseUserAccess(USER_TYPES.PATIENT), getPatientSubscriptionData)
    .get('/find-doctor/:doctorId', protectedRoutes, authoriseUserAccess(USER_TYPES.PATIENT), getDoctorById)
    .get('/subscription/current/patient/:subscriptionId', protectedRoutes, authoriseUserAccess(USER_TYPES.PATIENT), getSubscriptionWithPlans)
    .put('/subscription/current/patient/update/:subscriptionId', protectedRoutes, authoriseUserAccess(USER_TYPES.PATIENT), updateSubscriptionStatus)

// Note: There's a duplicate route in doctorRoute:
// .get('/plans', ...) appears twice with the same controller (getAllDoctorPlans)
// You should remove one of these duplicates