import { DataTypes } from "sequelize";
import { sequelize } from "../../config/database/sequelize";

export const Support = sequelize.define("support", {

    user_id: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    agent_id: {
        type: DataTypes.TEXT,

    },
    attachment: {
        type: DataTypes.TEXT,

    },
    content: {
        type: DataTypes.TEXT,

    },
    subject: {
        type: DataTypes.TEXT,

    },
    ticket_id: {
        type: DataTypes.TEXT,
    },

    catagory: {
        type: DataTypes.STRING,
    }
}, {
    tableName: "support",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
})