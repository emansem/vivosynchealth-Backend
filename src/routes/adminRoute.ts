import express from "express"
import { getAllTransactionsData } from "../controller/admin/transactionsController";
import { getAllDoctorsDetails } from "../controller/admin/doctorsController";

export const adminRoute = express.Router();
adminRoute
    .get('/transactions/all', getAllTransactionsData)
    .get('/doctors/details/all', getAllDoctorsDetails)