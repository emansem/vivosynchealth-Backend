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
    plan_status: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    plan_type: {
        type: DataTypes.STRING,
        allowNull: false,

    },
    isRefundEnabled: {
        type: DataTypes.STRING,
        allowNull: false,

    },
    plan_duration: {
        type: DataTypes.STRING,
        allowNull: false,

    },
    discount_percentage: {
        type: DataTypes.BIGINT,


    },
    refund_period: {
        type: DataTypes.BIGINT,


    },
    doctor_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    plan_features: {
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