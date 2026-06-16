import express from 'express';
import { adminAuthMiddleware } from '../middleware/authMiddleware.js';
import {
    getAdminAnalytics,
    getStudentsPerClass,
    getAttendanceOverview,
    getClassesPerformanceOverview,
    getAcademicTopStudentsAttendance
} from '../controllers/admin-analytics.controller.js';

const router = express.Router();

// Apply the Admin authentication middleware to protect all analytics endpoints
router.use(adminAuthMiddleware);

// ==========================================
// CARD COUNTS / DASHBOARD SUMMARY
// ==========================================
router.get('/analytics', getAdminAnalytics);

// ==========================================
// CHARTS & VISUALIZATION ENDPOINTS
// ==========================================
router.get('/analytics/students-per-class', getStudentsPerClass);
router.get('/analytics/attendance-overview', getAttendanceOverview);
router.get('/classes-performance-overview', getClassesPerformanceOverview);
router.get('/analytics/top-students-attendance', getAcademicTopStudentsAttendance);

export default router;