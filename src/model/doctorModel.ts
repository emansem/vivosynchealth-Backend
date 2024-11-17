import { DataTypes } from "sequelize";
import { sequelize } from "../config/database/sequelize";

export const doctor = sequelize.define('doctor', {
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
        defaultValue: "hello"
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