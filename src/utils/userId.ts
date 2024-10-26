
import crypto from "crypto"
export const generateUserId = () => crypto.randomUUID().slice(0, 15)