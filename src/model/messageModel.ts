import { DataTypes } from "sequelize";
import { sequelize } from "../config/database/sequelize";

export const message = sequelize.define('message', {
    chat_room: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    receiver_id: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    sender_id: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    timestamp: {
        type: DataTypes.DATE,

    },

}, {
    tableName: "message",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
})