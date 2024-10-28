import express, { Request, Response } from 'express';
import dotenv from "dotenv";
import { connection } from './config/database/mysql';

import { appErrorHandeler } from './middleware/errorHandeller';
import { generalRoute, loginRoute } from './routes/authRoute';
import { authRoute } from './routes/authRoute';
import { doctorRoute, patientRoute } from './routes/userRoute';
import { paymentRoute } from './routes/paymentRoute';
dotenv.config()

const app = express();
const port = 5740;

//ALL MIDDLEWARES HERE
app.use(express.json());

app.use(generalRoute);
app.use('/api/auth', authRoute)
app.use('/api', loginRoute);
app.use('/api/doctors', doctorRoute);
app.use('/api/patients', patientRoute);
app.use('/api/payment', paymentRoute)
app.use(appErrorHandeler);

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

