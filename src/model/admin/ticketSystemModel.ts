import { DataTypes } from "sequelize";
import { sequelize } from "../../config/database/sequelize";

export const TicketSystem = sequelize.define('ticket_system', {
    user_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    ticket_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    content: {
        type: DataTypes.STRING,
    },
    ticket_status: {
        type: DataTypes.STRING,
    },
    priority: {
        type: DataTypes.STRING,
    },
    catagory: {
        type: DataTypes.STRING,
    }
}, {
    tableName: "ticket_system",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
})