import express from "express";
import { createNewPatient } from "../controller/patientController";

export const patientRoute = express.Router();
export const doctorRoute = express.Router();

patientRoute.post("/register", createNewPatient);