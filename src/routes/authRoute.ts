import express from "express"
import { loginUser } from "../controller/authentication/login";
import { verifyEmail } from "../controller/authentication/verifyEmail";
import { createAccount } from "../controller/authentication/register";
import { forgotPassword } from "../controller/authentication/forgotPassword";
import { resetPassword } from "../controller/authentication/resetPassword";
import { resendLInk } from "../controller/authentication/resendLink";
import { protectedRoutes } from "../middleware/protection";
export const authRoute = express.Router();

export const generalRoute = express.Router();
export const loginRoute = express.Router();
authRoute
    .post('/register', createAccount)
    .post('/forgot-password', forgotPassword)
    .put('/verify-email/', verifyEmail)
    .put('/resend-link/', resendLInk)
    .post("/login", loginUser)
    .put('/reset-password/', resetPassword)



