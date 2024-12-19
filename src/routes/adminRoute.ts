import express from "express"
import { getAllTransactionsData } from "../controller/admin/transactionsController";
import { getAllDoctorsDetails } from "../controller/admin/doctorsController";
import { getAllPatientsData, getPatientDetails, updatePatientDetails } from "../controller/admin/patientsController";

export const adminRoute = express.Router();
adminRoute
    .get('/transactions/all', getAllTransactionsData)
    .get('/doctors/details/all', getAllDoctorsDetails)
    .get('/patients/details/all', getAllPatientsData)
    .get("/patients/single/details/:patient_id", getPatientDetails)
    .put("/patients/update/details/:patient_id", updatePatientDetails)