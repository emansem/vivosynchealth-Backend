import { DataTypes } from "sequelize";
import { sequelize } from "../config/database/sequelize";

export const deposit = sequelize.define("deposit", {
    amount: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    patient_id: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    payment_id: {
        type: DataTypes.TEXT,
        allowNull: false,
    }
}, {
    tableName: "deposit",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
})