import { DataTypes } from "sequelize";
import { sequelize } from "../config/database/sequelize";

export const doctor = sequelize.define('doctor', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,

    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
            isEmail: true
        }

    },
    profile_photo: {
        type: DataTypes.STRING,
        defaultValue: null
    },
    state: {
        type: DataTypes.STRING,
        defaultValue: null
    },
    years_of_experience: {
        type: DataTypes.STRING,
        defaultValue: null
    },
    isProfileCompleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    country: {
        type: DataTypes.STRING,
        defaultValue: null
    },
    city: {
        type: DataTypes.STRING,
        defaultValue: null
    },
    working_days: {
        type: DataTypes.STRING,
        defaultValue: null
    },
    hospital_address: {
        type: DataTypes.STRING,
        defaultValue: null
    },
    zip_code: {
        type: DataTypes.STRING,
        defaultValue: null
    },
    hospital_name: {
        type: DataTypes.STRING,
        defaultValue: null
    },
    medical_license: {
        type: DataTypes.STRING,
        defaultValue: null
    },
    about: {
        type: DataTypes.STRING,
        defaultValue: null
    },
    rating: {
        type: DataTypes.BIGINT,
        defaultValue: null,
    },
    languages: {
        type: DataTypes.STRING,
        defaultValue: null
    },
    speciality: {
        type: DataTypes.STRING,
        defaultValue: null
    },
    password_reset_token: {
        type: DataTypes.STRING,
        defaultValue: null
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,

    },
    phone_number: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    email_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    email_verify_token: {
        type: DataTypes.STRING
    },
    user_id: {
        type: DataTypes.STRING,
        defaultValue: ""
    },
    token_expires_in: {
        type: DataTypes.BIGINT
    },
    user_type: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    last_login: {
        type: DataTypes.BIGINT
    },
    password_updated_at: {
        type: DataTypes.BIGINT
    },
    last_login_ip: {
        type: DataTypes.STRING
    }
}, {
    tableName: "doctor",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
})