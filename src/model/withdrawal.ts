
import { DataTypes } from "sequelize";
import { sequelize } from "../config/database/sequelize";

export const withdrawal = sequelize.define("withdrawal", {
    amount: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    doctor_id: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    status: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    transaction_id: {
        type: DataTypes.TEXT,
        allowNull: false,
    }
}, {
    tableName: "withdrawal",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
})