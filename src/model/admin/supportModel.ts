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
    ticked_id: {
        type: DataTypes.TEXT,
    }
}, {
    tableName: "support",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
})