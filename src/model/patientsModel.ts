import { DataTypes } from "sequelize";
import { sequelize } from "../config/database/sequelize";

export const patient = sequelize.define('patient', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    first_name: {
        type: DataTypes.STRING,
        allowNull: false,

    },
    last_name: {
        type: DataTypes.STRING,
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
            isEmail: true
        }

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
    patient_id: {
        type: DataTypes.STRING,
        defaultValue: "hello"
    },
    token_expires_in: {
        type: DataTypes.BIGINT
    },
    user_type: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    gender: {
        type: DataTypes.STRING
    },
    password_reset_token: {
        type: DataTypes.STRING,
        defaultValue: null
    },
}, {
    tableName: "patient",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
})