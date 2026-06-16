import express from 'express';
import { studentAuthMiddleware } from '../middleware/authMiddleware.js';
import {
    loginStudent,
    refreshAccessToken,
    logout
} from '../controllers/student-auth.controller.js';

const router = express.Router();

// ==========================================
// PUBLIC STUDENT AUTHENTICATION ROUTES
// ==========================================
router.post('/login', loginStudent);
router.post('/refresh', refreshAccessToken);

// ==========================================
// PRIVATE / PROTECTED STUDENT AUTHENTICATION ROUTES
// ==========================================
// Protects endpoints declaration underneath this middleware hook
router.use(studentAuthMiddleware);

router.post('/logout', logout);

export default router;