import nodemailer from 'nodemailer';
import path from "path";
import fs from "fs"
import dotenv from "dotenv";
dotenv.config()

// Nodemailer transport setup
const transporter = nodemailer.createTransport({
    port: 587,
    host: process.env.EMAIL_HOST,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER_NAME,
        pass: process.env.EMAIL_PASSWORD,
    },
});


export const sendResentPasswordEmail = async (fistName: string, email: string, code: string) => {
    try {

        let html = fs.readFileSync(path.join(__dirname, "../view/resetPassword.html"), "utf8")
        html = html
            .replace("{{username}}", fistName)
            .replace("{{code}}", code)
        // Email options
        const mailOptions = {
            from: `VivoSyncHealth ${process.env.EMAIL_USER_NAME}`,
            to: email,
            subject: 'Reset your password',
            html: html,
        };

        // Send the email
        await transporter.sendMail(mailOptions);

    } catch (error) {
        console.error('Error sending email:', error);
    }
};

