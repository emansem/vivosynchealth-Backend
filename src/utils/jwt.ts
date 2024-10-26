import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config();
const jwtSecret = process.env.JWT_SECRET_CODE as string
export const generateJwt = (id: string) => {

    return jwt.sign({ id }, jwtSecret, { expiresIn: process.env.JWT_EXPIRESIn })
}

export const verifyTOken = (token: string) => {
    const jwtSecret = process.env.JWT_SECRET_CODE as string
    return jwt.verify(token, jwtSecret)
}