import { DataTypes } from "sequelize";
import { sequelize } from "../config/database/sequelize";

export const Countries = sequelize.define("countries", {
    name: {
        type: DataTypes.TEXT,

    },
    flag: {
        type: DataTypes.TEXT,
    },
    cities: {
        type: DataTypes.STRING,
    },
    states: {
        type: DataTypes.TEXT,
    },
    country_code: {
        type: DataTypes.TEXT,
    },
}, {
    tableName: "countries",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
})