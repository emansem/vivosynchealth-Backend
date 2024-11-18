import express, { Request, Response } from 'express';
import dotenv from "dotenv";
import cors from "cors"
import { connection } from './config/database/mysql';

import { appErrorHandeler } from './middleware/errorHandeller';
import { generalRoute, loginRoute } from './routes/authRoute';
import { authRoute } from './routes/authRoute';
import { doctorRoute, patientRoute, userRoute } from './routes/userRoute';
import { paymentRoute } from './routes/paymentRoute';
import { messageRoutes } from './routes/messages';
dotenv.config()

const app = express();
const port = 5740;

//ALL MIDDLEWARES HERE
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(generalRoute);
app.use('/api/auth', authRoute)
app.use('/api', loginRoute);
app.use("/api", userRoute);
app.use('/api/doctors', doctorRoute);
app.use("/api/message", messageRoutes);
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



