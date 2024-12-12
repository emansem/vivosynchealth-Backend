import { Sequelize } from "sequelize";
import dotenv from "dotenv"
dotenv.config()
// sequelize.js
const host = process.env.DATABASE_HOST as string;
const user = process.env.DATABASE_USERNAME as string;
const database = process.env.DATABASE_NAME as string;
const password = process.env.DATABASE_PASSWORD;
export const sequelize = new Sequelize(database, user, password, {
    host,
    dialect: 'mysql',
});


