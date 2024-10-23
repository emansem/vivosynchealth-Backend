import express, { Request, Response } from 'express';
import dotenv from "dotenv";
import { connection } from './config/database/mysql';
dotenv.config()


const app = express();
const port = 3000;


app.use(express.json());


app.get('/', (req: Request, res: Response) => {
    res.send('Hello, TypeScript with Express!');
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});



//TEST msql CONNECTION
connection.connect((err) => {
    if (err) {
        console.log('Error connection to the database', err);
        return
    }
    else
        console.log('Connection to the database was successful');
})