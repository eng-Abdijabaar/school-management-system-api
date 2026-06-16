import express from 'express';
import { teacherAuthMiddleware } from '../middleware/authMiddleware.js';
import {
    login,
    forgotPassword,
    resetPassword,
    refreshAccessToken,
    logout
} from '../controllers/teacher-auth.controller.js';

const router = express.Router();

// ==========================================
// PUBLIC AUTHENTICATION ROUTES
// ==========================================
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.post('/refresh', refreshAccessToken);

// ==========================================
// PRIVATE / PROTECTED AUTHENTICATION ROUTES
// ==========================================
// Protects the endpoints underneath this middleware hook
router.use(teacherAuthMiddleware);

router.post('/logout', logout);

export default router;