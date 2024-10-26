import crypto from "crypto"

export const generateEmailToken = () => crypto.randomBytes(32).toString('hex');
