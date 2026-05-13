import express from 'express';
import cors from 'cors';
import { connectDB } from "./config/db.js"
import dotenv from "dotenv";
import adminAuthRoutes from './routes/admin-auth.routes.js';
import cookieParser from 'cookie-parser';
import adminCrudeRoutes from './routes/admin-crude.routes.js';
import teacherAuthRoutes from './routes/teacher-auth.routes.js'
import teacherCrudeRoutes from './routes/teacher-crude.routes.js'

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Routes
app.get('/', (req, res) => {
    res.send('Welcome to the School Dashboard API');
});

// Admin routes
app.use('/api/auth', adminAuthRoutes);
app.use('/api/admin', adminCrudeRoutes);

// teacher routes
app.use('/api/auth/teacher', teacherAuthRoutes);
app.use('/api/teacher', teacherCrudeRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});