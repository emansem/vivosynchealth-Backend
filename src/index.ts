import express, { Request, Response } from 'express';
import dotenv from "dotenv";
import cors from "cors"
import { connection } from './config/database/mysql';
import { createServer } from 'http';
import { appErrorHandeler } from './middleware/errorHandeller';
import { generalRoute, loginRoute } from './routes/authRoute';
import { authRoute } from './routes/authRoute';
import { doctorRoute, patientRoute, userRoute } from './routes/userRoute';
import { paymentRoute } from './routes/paymentRoute';
import { messageRoutes } from './routes/messages';
import { Server } from 'socket.io';
import { adminRoute } from './routes/adminRoute';
dotenv.config()

const app = express();
const port = 5740;
const httpServer = createServer(app)

//ALL MIDDLEWARES HERE
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

export const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }

})

// Socket server: Handling room joining
io.on('connection', (socket) => {
    // Keep track of which room this socket is in
    let currentRoom: string | null = null;

    socket.on('join_room', (roomId) => {
        // Store the room ID for later use
        currentRoom = roomId;

        // First join the room
        socket.join(roomId);
        console.log(`Socket ${socket.id} joined room ${roomId}`);

        // Emit to everyone in the room EXCEPT the sender
        socket.to(roomId).emit('user_joined', {
            message: 'New user joined the chat'
        });

        // Emit online status to EVERYONE in the room INCLUDING the sender
        io.in(roomId).emit('status_change', {
            userId: socket.id,
            status: 'online'
        });
    });

    socket.on('disconnect', () => {
        console.log(`Socket ${socket.id} disconnected`);

        // Only emit offline status if the socket was in a room
        if (currentRoom) {
            io.in(currentRoom).emit('status_change', {
                userId: socket.id,
                status: 'offline'
            });
        }
    });
});



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
app.use('/api/admin', adminRoute)
app.use(appErrorHandeler);

app.get('/', (req: Request, res: Response) => {
    res.send('Hello, TypeScript with Express!');
});

httpServer.listen(port, () => {
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



// //Sequelize Basic comparison operators CheatSheet
// Op.eq    // equals (=)
// Op.ne    // not equals (!=)
// Op.gt    // greater than (>)
// Op.gte   // greater than or equal to (>=)
// Op.lt    // less than (<)
// Op.lte   // less than or equal to (<=)

// // More advanced operators
// Op.between      // between two values
// Op.notBetween   // not between two values
// Op.in           // in a list of values
// Op.notIn        // not in a list of values
// Op.like         // pattern matching (%)
// Op.notLike      // opposite of pattern matching