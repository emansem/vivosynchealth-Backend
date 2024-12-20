import { DataTypes } from "sequelize";
import { sequelize } from "../config/database/sequelize";

export const Admin = sequelize.define("admin", {

    total_balance: {
        type: DataTypes.BIGINT,

    },
    profile_photo: {
        type: DataTypes.TEXT,

    },
    name: {
        type: DataTypes.TEXT,

    },

}, {
    tableName: "admin",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
})