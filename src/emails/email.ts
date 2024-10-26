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


export const sendVerificationEmail = async (fistName: string, email: string, verifyLInk: string) => {
    try {

        let html = fs.readFileSync(path.join(__dirname, "../view/verifyEmail.html"), "utf8")
        html = html
            .replace("{{username}}", fistName)
            .replace("{{verifyLink}}", verifyLInk)
        // Email options
        const mailOptions = {
            from: '"VIvoSyncHealth" info@royaltrading.site',
            to: email,
            subject: 'Please Verify Your Email',
            html: html,
        };

        // Send the email
        await transporter.sendMail(mailOptions);
        // console.log('Verification email sent to:', html);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

