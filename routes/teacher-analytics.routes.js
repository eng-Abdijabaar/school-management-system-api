import express from 'express';
import { teacherAuthMiddleware } from '../middleware/authMiddleware.js';
import {
    getAcademicAnalytics,
    getTeacherTopStudents,
    getTeacherTopStudentsAttendance,
    getAttendanceOverview,
    getClassesPerformanceOverview
} from '../controllers/teacher-analytics.controller.js';

const router = express.Router();

// Apply the Teacher authentication middleware to protect all analytics routes
router.use(teacherAuthMiddleware);

// ==========================================
// CARD COUNTS / ACADEMIC ANALYTICS
// ==========================================
router.get('/teacher-academics', getAcademicAnalytics);

// ==========================================
// PERFORMANCE RANKINGS & TOP STUDENTS
// ==========================================
router.get('/getTeacherTopStudents', getTeacherTopStudents);
router.get('/getTeacherTopStudentsAttendance', getTeacherTopStudentsAttendance);

// ==========================================
// CHARTS & VISUALIZATION OVERVIEWS
// ==========================================
router.get('/teacher/attendance-overview', getAttendanceOverview);
router.get('/teacher/classes-performance-overview', getClassesPerformanceOverview);

export default router;