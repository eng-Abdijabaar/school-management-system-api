import express from 'express';
import { adminAuthMiddleware } from '../middleware/authMiddleware.js';
import {
    createTeacher,
    getTeachers,
    getTeacherById,
    deleteTeacher,
    updateTeacher,
    getActiveTeachers,
    getInactiveTeachers,
    createStudent,
    getStudents,
    getStudentById,
    getStudentsBySection,
    deleteStudent,
    updateStudent,
    getActiveStudents,
    getInactiveStudents,
    getStudentPassword,
    createClass,
    getClasses,
    updateClass,
    deleteClass,
    getActiveClasses,
    getInactiveClasses,
    getClassById,
    getClassesBySection,
    removeStudent,
    createSubject,
    getSubjects,
    updateSubject,
    deleteSubject,
    getSubjectById,
    getSubjectsBySection,
    assignSubject,
    removeSubject,
    getAllAttendance,
    getAttendanceByDateRange,
    getAttendanceByTeacher,
    getAttendanceByStudent,
    getAttendanceByClass,
    getAttendanceBySubject,
    getAttendanceById,
    updateAttendanceById,
    createExam,
    getAllExams,
    getExamById,
    updateExam,
    deleteExam,
    getAssignments,
    deleteAssignment,
    createAssignment,
    assignStudentToClass
} from '../controllers/admin-crude.controller.js';

const router = express.Router();

// Apply the Admin authentication middleware to protect all routes below
router.use(adminAuthMiddleware);

// ==========================================
// TEACHER MANAGEMENT ROUTES
// ==========================================
router.post('/createTeacher', createTeacher);
router.get('/getTeachers', getTeachers);
router.get('/getActiveTeachers', getActiveTeachers);
router.get('/getInactiveTeachers', getInactiveTeachers);
router.get('/getTeacherById/:id', getTeacherById);
router.put('/updateTeacher/:id', updateTeacher);
router.delete('/deleteTeacher/:id', deleteTeacher);

// ==========================================
// STUDENT MANAGEMENT ROUTES
// ==========================================
router.post('/createStudent', createStudent);
router.get('/getStudents', getStudents);
router.get('/getActiveStudents', getActiveStudents);
router.get('/getInactiveStudents', getInactiveStudents);
router.get('/getStudentById/:id', getStudentById);
router.get('/getStudentsBySection/:section', getStudentsBySection);
router.get('/getStudentPassword/:id', getStudentPassword);
router.put('/updateStudent/:id', updateStudent);
router.delete('/deleteStudent/:id', deleteStudent);

// ==========================================
// CLASS MANAGEMENT ROUTES
// ==========================================
router.post('/createClass', createClass);
router.get('/getClasses', getClasses);
router.get('/getActiveClasses', getActiveClasses);
router.get('/getInactiveClasses', getInactiveClasses);
router.get('/getClassById/:id', getClassById);
router.get('/getClassesBySection/:section', getClassesBySection);
router.put('/updateClass/:id', updateClass);
router.put('/removeStudent/:id', removeStudent);
router.delete('/deleteClass/:id', deleteClass);

// ==========================================
// SUBJECT MANAGEMENT ROUTES
// ==========================================
router.post('/createSubject', createSubject);
router.get('/getSubjects', getSubjects);
router.get('/getSubjectsBySection/:section', getSubjectsBySection);
router.get('/getSubjectById/:id', getSubjectById);
router.put('/updateSubject/:id', updateSubject);
router.delete('/deleteSubject/:id', deleteSubject);



// ==========================================
// ATTENDANCE MANAGEMENT ROUTES
// ==========================================
router.get('/getAllAttendance', getAllAttendance);
router.get('/getAttendanceByDateRange', getAttendanceByDateRange);
router.get('/getAttendanceById/:id', getAttendanceById);
router.get('/getAttendanceByTeacher/:teacherId', getAttendanceByTeacher);
router.get('/getAttendanceByStudent/:studentId', getAttendanceByStudent);
router.get('/getAttendanceByClass/:classId', getAttendanceByClass);
router.get('/getAttendanceBySubject/:subjectId', getAttendanceBySubject);
router.put('/updateAttendanceById/:id', updateAttendanceById);

// ==========================================
// EXAM MANAGEMENT ROUTES
// ==========================================
router.post('/createExam', createExam);
router.get('/getAllExams', getAllExams);
router.get('/getExamById/:id', getExamById);
router.put('/updateExam/:id', updateExam);
router.delete('/deleteExam/:id', deleteExam);

// ==========================================
// ASSIGNMENT MANAGEMENT ROUTES
// ==========================================
router.post('/createAssignment', createAssignment);
router.get('/getAssignments', getAssignments);
router.delete('/deleteAssignment/:id', deleteAssignment);
router.post('/assignStudentToClass', assignStudentToClass);

export default router;