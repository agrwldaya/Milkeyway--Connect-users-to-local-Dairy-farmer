import express from 'express';
import dotenv from 'dotenv/config';
import { connectToDb } from './config/database/connection.js';
import { cloudinaryconnect } from './config/cloudinary.js';
import farmerRouter from './routes/farmerRoutes.js';
import fileUpload from "express-fileupload";
import consumerRouter from './routes/consumerRoute.js';
import AdminRouter from './routes/adminRoute.js';
import cors from 'cors';
import authRouter from './routes/auth.js';
import cookieParser from 'cookie-parser';

const app = express();
app.use(express.json());
// Enable CORS for frontend with credentials (cookies)
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
// Parse cookies so auth middleware can read JWT from httpOnly cookie
app.use(cookieParser());
app.set('trust proxy', 1);
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));
 

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    await connectToDb();
    cloudinaryconnect();
    app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    });
    app.get('/', (req, res) => {
    res.send('Hello World!');
    });
    
  } catch (error) {
    console.error("Error starting the server:", error);
    process.exit(1);
  }
};

startServer();

// Routes

app.use('/api/v1/farmers',farmerRouter);
app.use('/api/v1/consumers',consumerRouter);
app.use('/api/v1/admin', AdminRouter);

//logout route
app.use('/api/v1/auth', authRouter);


