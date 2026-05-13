import express from 'express';
import { register, login, verifyEmail, forgotPassword, resetPassword, logout, refreshAccessToken } from '../controllers/admin-auth.controller.js';
import {adminAuthMiddleware} from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/logout', adminAuthMiddleware, logout);
router.post('/refresh', refreshAccessToken);

router.get('/protected', adminAuthMiddleware, (req, res) => {
    res.status(200).json({ message: 'You have accessed a protected route', user: req.user });
});

export default router;



// http://localhost:5000/api/auth/ , this is the base url for all auth routes, so for example to register a user, the full url will be http://localhost:5000/api/auth/register