import express from "express"
import { createAccount, forgotPassword, resetPassword } from "../controller/authController";
import { loginUser } from "../controller/loginUserController";
import { verifyEmail } from "../controller/verifyEmail";
export const authRoute = express.Router();

export const generalRoute = express.Router();
export const loginRoute = express.Router();
authRoute
    .post('/register', createAccount)
    .post('/forgot-password', forgotPassword)
    .post('/verify-email/:token', verifyEmail)
    .post("/login", loginUser)
    .put('/reset-password/:token', resetPassword)



