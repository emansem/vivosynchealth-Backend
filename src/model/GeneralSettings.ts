import { DataTypes } from "sequelize";
import { sequelize } from "../config/database/sequelize";

export const Support = sequelize.define("general_settings", {

    website_name: {
        type: DataTypes.TEXT,

    },
    website_status: {
        type: DataTypes.TEXT,

    },
    suport_email: {
        type: DataTypes.TEXT,

    },
    support_phone: {
        type: DataTypes.TEXT,

    },
    subscription_duration: {
        type: DataTypes.TEXT,

    },
    meta_description: {
        type: DataTypes.TEXT,

    },
    meta_keywords: {
        type: DataTypes.TEXT,

    },
    website_tagline: {
        type: DataTypes.TEXT,

    },
    patient_fee: {
        type: DataTypes.INTEGER,

    },
    doctor_commission: {
        type: DataTypes.INTEGER,

    },

}, {

    tableName: "general_settings",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
})