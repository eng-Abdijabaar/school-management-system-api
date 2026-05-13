import express from "express";
import { forgotPassword, login, logout, refreshAccessToken, resetPassword } from "../controllers/teacher-auth.controller.js";
import { teacherAuthMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post('/login', login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/refresh", refreshAccessToken);
router.post("/logout", teacherAuthMiddleware, logout);


export default router;

// http://localhost:5000/api/auth/teacher , this is the base url for all auth routes, so for example to login a teacher, the full url will be http://localhost:5000/api/auth/teacher/login