import express from 'express';
import { teacherAuthMiddleware } from '../middleware/authMiddleware.js';
import {
    getClasses,
    getSubjects,
    getClass,
    setupAttendance,
    createAttendance,
    updateAttendance,
    getTeacherExams,
    getExamById,
    uploadExam
} from '../controllers/teacher-crude.controller.js';

const router = express.Router();

// Apply the Teacher authentication middleware to protect all routes below
router.use(teacherAuthMiddleware);

// ==========================================
// CLASS & SUBJECT ACQUISITION ROUTES
// ==========================================
router.get('/getClasses', getClasses);
router.get('/getSubjects', getSubjects);
router.get('/getClass/:id', getClass);

// ==========================================
// ATTENDANCE MANAGEMENT ROUTES
// ==========================================
router.get('/setup-attendance/:id', setupAttendance);
router.post('/create-attendance', createAttendance);
router.put('/update-attendance/:id', updateAttendance);

// ==========================================
// EXAM MANAGEMENT ROUTES
// ==========================================
router.get('/get-teacher-exams', getTeacherExams);
router.get('/get-exam/:id', getExamById);
router.post('/upload-exam/:id', uploadExam);

export default router;