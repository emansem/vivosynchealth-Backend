import { DataTypes } from "sequelize";
import { sequelize } from "../config/database/sequelize";

export const Specialty = sequelize.define("specialty", {
    title: {
        type: DataTypes.TEXT,

    },
    icon: {
        type: DataTypes.TEXT,
    },
    status: {
        type: DataTypes.STRING,
    },
    icon_color: {
        type: DataTypes.TEXT,
    },
    bg_color: {
        type: DataTypes.TEXT,
    }, description: {
        type: DataTypes.TEXT,
    },
}, {
    tableName: "specialty",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
})