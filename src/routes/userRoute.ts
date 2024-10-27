import express from "express"
import { getAllDoctors, getDoctorById } from "../controller/userController/doctor/getDoctor";
import { protectedRoutes } from "../middleware/protection";
import { createAPlan, deleteDoctorPlan, getAllDoctorPlans, getDoctorPlan, updatePlan } from "../controller/userController/doctor/subscriptionPlan";

export const doctorRoute = express.Router();
doctorRoute
    .get('/', protectedRoutes, getAllDoctors)
    .get('/:id', protectedRoutes, getDoctorById)
    .post('/create-plan', protectedRoutes, createAPlan)
    .put('/plan/:id', protectedRoutes, updatePlan)
    .get("/plan/:id", protectedRoutes, getDoctorPlan)
    .get('/plans/:doctor_id', protectedRoutes, getAllDoctorPlans)
    .delete("/plan/:id", protectedRoutes, deleteDoctorPlan);


