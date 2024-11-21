import { DataTypes } from "sequelize";
import { sequelize } from "../config/database/sequelize";

export const patient = sequelize.define('patient', {
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
    gender: {
        type: DataTypes.STRING
    },
    password_reset_token: {
        type: DataTypes.STRING,
        defaultValue: null
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
    tableName: "patient",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
})