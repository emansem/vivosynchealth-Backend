import { DataTypes } from "sequelize";
import { sequelize } from "../config/database/sequelize";

export const paymentHistory = sequelize.define("payment_history", {
    doctor_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    patient_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    amount: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    payment_id: {
        type: DataTypes.STRING,
        allowNull: false,

    },
    payment_method: {
        type: DataTypes.STRING
    }



}, {
    tableName: "payment_history",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
})