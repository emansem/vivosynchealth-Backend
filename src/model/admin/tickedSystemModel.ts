import { DataTypes } from "sequelize";
import { sequelize } from "../../config/database/sequelize";

export const TickedSystem = sequelize.define('ticked_system', {
    user_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    ticked_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    content: {
        type: DataTypes.STRING,
    },
    ticked_status: {
        type: DataTypes.STRING,
    },
    priority: {
        type: DataTypes.STRING,
    }
}, {
    tableName: "ticked_system",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
})