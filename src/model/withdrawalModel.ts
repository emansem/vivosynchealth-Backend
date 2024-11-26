import { DataTypes } from "sequelize";
import { sequelize } from "../config/database/sequelize";

export const withdrawalAccount = sequelize.define("withdrawal_method", {
    doctor_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
    },
    account_number: {
        type: DataTypes.BIGINT,
        allowNull: false,
        unique: true,

    },
    account_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    bank_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    withdrawal_pin: {
        type: DataTypes.STRING,
        allowNull: false,

    }

}, {
    tableName: "withdrawal_account",
    createdAt: "created_at",
    updatedAt: "updated_at",
    timestamps: true
})