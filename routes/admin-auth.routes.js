import express from 'express';
import { adminAuthMiddleware } from '../middleware/authMiddleware.js';
import {
    register,
    verifyEmail,
    login,
    forgotPassword,
    resetPassword,
    refreshAccessToken,
    logout
} from '../controllers/admin-auth.controller.js';

const router = express.Router();

// ==========================================
// PUBLIC AUTHENTICATION ROUTES
// ==========================================
router.post('/register', register);
router.post('/login', login);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.post('/refresh', refreshAccessToken);

// ==========================================
// PRIVATE / PROTECTED AUTHENTICATION ROUTES
// ==========================================
// Protects the endpoints underneath this middleware hook
router.use(adminAuthMiddleware);

router.post('/logout', logout);

export default router;