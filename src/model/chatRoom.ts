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
    },
    content: {
        type: DataTypes.STRING,
    },
    last_senderId: {
        type: DataTypes.STRING,
    }
}, {
    tableName: "chat_room",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
})