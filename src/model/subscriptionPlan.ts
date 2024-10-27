import { DataTypes } from "sequelize";
import { sequelize } from "../config/database/sequelize";

export const plan = sequelize.define("plans", {
    name: {
        type: DataTypes.STRING,
        allowNull: false,

    },
    amount: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    doctor_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    plan_items: {
        type: DataTypes.TEXT,

    },
    coupon_id: {
        type: DataTypes.STRING
    }
}, {
    tableName: "plans",
    createdAt: "created_at",
    updatedAt: "updated_at",
    timestamps: true
})