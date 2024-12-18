import express from "express"
import { protectedRoutes } from "../middleware/protection";
import { getAllTransactionsData } from "../controller/admin/transactionsController";

export const adminRoute = express.Router();
adminRoute
    .get('/transactions/all', getAllTransactionsData)