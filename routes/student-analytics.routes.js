import express from 'express';
import { studentAuthMiddleware } from '../middleware/authMiddleware.js';
import { getStudentAttendanceAnalytics } from '../controllers/student-analytics.controller.js';

const router = express.Router();

// Apply the Student authentication middleware to protect all student analytics endpoints
router.use(studentAuthMiddleware);

// ==========================================
// ATTENDANCE ANALYTICS
// ==========================================
router.get('/student/student-analytics', getStudentAttendanceAnalytics);

export default router;