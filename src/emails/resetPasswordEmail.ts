import nodemailer from 'nodemailer';
import pug from "pug"
import path from "path";
import fs from "fs"
// Nodemailer transport setup
const transporter = nodemailer.createTransport({
    port: 587,
    host: "smtp.titan.email",
    secure: false,
    auth: {
        user: "info@royaltrading.site",
        pass: "Bungsem45@",
    },
});


export const sendResentPasswordEmail = async (fistName: string, email: string, resetLInk: string) => {
    try {

        let html = fs.readFileSync(path.join(__dirname, "../view/resetPassword.html"), "utf8")
        html = html
            .replace("{{username}}", fistName)
            .replace("{{resetLink}}", resetLInk)
        // Email options
        const mailOptions = {
            from: '"VIvoSyncHealth" info@royaltrading.site',
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

