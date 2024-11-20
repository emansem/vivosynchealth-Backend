import nodemailer from 'nodemailer';
import path from "path";
import fs from "fs"
import dotenv from "dotenv";
import { AppError } from '../middleware/errors';
import { NextFunction } from 'express';
dotenv.config();
// Nodemailer transport setup
const transporter = nodemailer.createTransport({
    port: 587,
    host: process.env.EMAIL_HOST,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER_NAME,
        pass: process.env.EMAIL_PASSWORD
    },
});


export const sendVerificationEmail = async (fistName: string, email: string, verifyLInk: string, next: NextFunction): Promise<boolean> => {
    try {

        let html = fs.readFileSync(path.join(__dirname, "../view/verifyEmail.html"), "utf8")
        html = html
            .replace("{{username}}", fistName)
            .replace("{{verifyLink}}", verifyLInk)
        // Email options
        const mailOptions = {
            from: `VivoSynchealth  ${process.env.EMAIL_USER_NAME}`,
            to: email,
            subject: 'Please Verify Your Email',
            html: html,
        };

        // Send the email
        await transporter.sendMail(mailOptions);
        return true
        // console.log('Verification email sent to:', html);
    } catch (error) {
        next(new AppError("Error sending email", 400))
        return false
    }
};

