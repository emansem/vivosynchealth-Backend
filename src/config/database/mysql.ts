
import mysql from "mysql2";
import dotenv from "dotenv";
dotenv.config()
//DATABASE CONNECTION  EDIT CREDENTIALS IN ENV FILE
export const connection = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USERNAME,
    database: process.env.DATABASE_NAME,
    password: process.env.DATABASE_PASSWORD

});

