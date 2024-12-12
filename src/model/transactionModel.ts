import { DataTypes } from "sequelize";
import { sequelize } from "../config/database/sequelize";

export const transaction = sequelize.define("transactions", {
    patient_id: {
        type: DataTypes.TEXT,


    },
    doctor_id: {
        type: DataTypes.TEXT,


    },
    type: {
        type: DataTypes.STRING,
        allowNull: false,

    },
    amount: {
        type: DataTypes.BIGINT,
        allowNull: false,

    },
    transaction_id: {
        type: DataTypes.TEXT,

    }
}, {
    tableName: "transactions",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
})