import { DataTypes } from "sequelize";
import { sequelize } from "../config/database/sequelize";

export const subscription = sequelize.define("subscription", {
    doctor_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    patient_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    expire_date: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    payment_id: {
        type: DataTypes.STRING,
        allowNull: false,

    },
    plan_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    subscription_status: {
        type: DataTypes.STRING
    }


}, {
    tableName: "subscription",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
})