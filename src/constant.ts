// 2. Constants
export const USER_TYPES = {
    ADMIN: 'admin',
    PATIENT: 'patient',
    DOCTOR: 'doctor'
} as const;

export const EMAIL_SUBJECT = {
    RESET_PASSWORD: 'RESET_PASSWORD',
    VERIFY_EMAIL: 'EMAIL_VERIFICATION',
} as const


// errors/messages.ts
export const ERROR_MESSAGES = {
    // Auth related errors
    AUTH: {
        INVALID_INPUT: "Please provide valid credentials",
        INVALID_TOKEN: "Invalid or expired token",
        EMAIL_VERIFIED: "Email already verified",
        USER_NOT_FOUND: "User not found"
    },

    // General errors (reusable across controllers)
    GENERAL: {
        NOT_FOUND: "Resource not found",
        SERVER_ERROR: "Something went wrong",
        INVALID_ID: "Invalid ID provided",
        REQUIRED_FIELDS: "Please fill all required fields",
        UNAUTHORIZED: "Unauthorized access",
        FORBIDDEN: "Access forbidden"
    },

    // Email related errors
    EMAIL: {
        SEND_FAILED: "Failed to send email",
        INVALID_FORMAT: "Invalid email format"
    }
} as const;

export const SENSITIVE_USER_FIELDS = [
    'password',
    'password_reset_token',
    'email_verify_token',
    "password_updated_at",
    "last_login_ip",
    "token_expires_in",
    "email_verified"
]