import express from 'express';
import { 
    createAttendance,
    getClass,
    getClasses, 
    getSubjects, 
    setupAttendance, 
    updateAttendance
} from '../controllers/teacher-crude.controller.js';
import { teacherAuthMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/getClasses', teacherAuthMiddleware, getClasses);
router.get('/getClassById/:id', teacherAuthMiddleware, getClass);
router.get('/getSubjects', teacherAuthMiddleware, getSubjects);
router.get('/setupAttendance', teacherAuthMiddleware, setupAttendance);
router.post('/create-attendance', teacherAuthMiddleware, createAttendance);
router.put('/update-attendance/:id', teacherAuthMiddleware, updateAttendance);

export default router;

// http://localhost:5000/api/teacher/ , this is the base url for all teacher routes, so for example to create a attendance, the full url will be http://localhost:5000/api/teacher/create-attendance