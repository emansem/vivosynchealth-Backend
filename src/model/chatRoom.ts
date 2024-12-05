import { DataTypes } from "sequelize";
import { sequelize } from "../config/database/sequelize";

export const chatRoom = sequelize.define('chat_room', {
    sender_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    receiver_id: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: "chat_room",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
})