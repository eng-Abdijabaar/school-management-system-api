import express from 'express';
import cors from 'cors';
import { connectDB } from "./config/db.js"
import dotenv from "dotenv";
import cookieParser from 'cookie-parser';

import adminAuthRoutes from './routes/admin-auth.routes.js';
import adminCrudeRoutes from './routes/admin-crude.routes.js';
import adminAnalyticsRoutes from './routes/admin-analytics.routes.js';

import teacherAuthRoutes from './routes/teacher-auth.routes.js';
import teacherCrudeRoutes from './routes/teacher-crude.routes.js';
import teacherAnalyticsRoutes from './routes/teacher-analytics.routes.js';

import studentAuthRoutes from './routes/student-auth.routes.js';
import studentAnalyticsRoutes from './routes/student-analytics.routes.js';


dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
    credentials: true,
    origin: 'http://localhost:5173',
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.get('/', (req, res) => {
    res.send('Welcome to the School Dashboard API');
});

// --- Admin Endpoints ---
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin', adminCrudeRoutes);
app.use('/api/admin', adminAnalyticsRoutes);

// --- Teacher Endpoints ---
app.use('/api/teacher/auth', teacherAuthRoutes);
app.use('/api/teacher', teacherCrudeRoutes);
app.use('/api/teacher', teacherAnalyticsRoutes);

// --- Student Endpoints ---
app.use('/api/student/auth', studentAuthRoutes);
app.use('/api/student', studentAnalyticsRoutes);

// ==========================================
// GLOBAL ERROR HANDLING MIDDLEWARES
// ==========================================
// Catch-all 404 handler for unmatched routes
app.use((req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
});



// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});