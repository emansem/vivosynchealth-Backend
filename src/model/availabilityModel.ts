import { DataTypes } from "sequelize";
import { sequelize } from "../config/database/sequelize";

export const Availability = sequelize.define("availability", {
    day: {
        type: DataTypes.TEXT,

    },
    day_code: {
        type: DataTypes.TEXT,
    },
    working_time: {
        type: DataTypes.STRING,
    },

}, {
    tableName: "availability",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
})