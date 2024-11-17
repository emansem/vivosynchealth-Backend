import { DataTypes } from "sequelize";
import { sequelize } from "../config/database/sequelize";

export const messageAssistant = sequelize.define("message_assistant", {
    message: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    user_id: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    user_prompt: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: "message_assistant",
    updatedAt: "updated_at",
    createdAt: "created_at",
    timestamps: true
})