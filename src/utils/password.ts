import bcrypt from "bcrypt"

//function to hash password
export const hashPassword = async (password: string) => {
    try {
        return bcrypt.hash(password, 10)
    } catch (error) {
        console.log('Error hashing password', error);
    }
}

//function to compare password
export const comparePassword = async (newPassword: string, oldPassword: string) => {
    try {
        return bcrypt.compare(newPassword, oldPassword)
    } catch (error: any) {
        throw new error
    }
}