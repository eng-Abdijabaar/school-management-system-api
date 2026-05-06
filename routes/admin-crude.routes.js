import express from "express";
import {
    createTeacher,
    getTeachers,
    getTeacherById,
    deleteTeacher, 
    updateTeacher, 
    getActiveTeachers, 
    createStudent, 
    getInactiveTeachers, 
    getStudents, 
    getStudentById, 
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
    createSubject, 
    getSubjects, 
    updateSubject, 
    deleteSubject, 
    getSubjectById
} from "../controllers/admin-crude.controller.js";
import adminAuthMiddleware from "../middleware/adminAuthMiddleware.js";

const router = express.Router();

router.post("/createTeacher", adminAuthMiddleware, createTeacher);
router.get("/getTeachers", adminAuthMiddleware, getTeachers);
router.get("/getTeacherById/:id", adminAuthMiddleware, getTeacherById);
router.delete("/deleteTeacher/:id", adminAuthMiddleware, deleteTeacher);
router.put("/updateTeacher/:id", adminAuthMiddleware, updateTeacher);
router.get("/getActiveTeachers", adminAuthMiddleware, getActiveTeachers);
router.get("/getInactiveTeachers", adminAuthMiddleware, getInactiveTeachers);

router.post("/createStudent", adminAuthMiddleware, createStudent);
router.get("/getStudents", adminAuthMiddleware, getStudents);
router.get("/getStudentById/:id", adminAuthMiddleware, getStudentById);
router.delete("/deleteStudent/:id", adminAuthMiddleware, deleteStudent);
router.put("/updateStudent/:id", adminAuthMiddleware, updateStudent);
router.get("/getActiveStudents", adminAuthMiddleware, getActiveStudents);
router.get("/getInactiveStudents", adminAuthMiddleware, getInactiveStudents);
router.get("/getStudentPassword/:id", adminAuthMiddleware, getStudentPassword);

router.post("/createClass", adminAuthMiddleware, createClass);
router.get("/getClasses", adminAuthMiddleware, getClasses);
router.put("/updateClass/:id", adminAuthMiddleware, updateClass);
router.delete("/deleteClass/:id", adminAuthMiddleware, deleteClass);
router.get("/getActiveClasses", adminAuthMiddleware, getActiveClasses);
router.get("/getInactiveClasses", adminAuthMiddleware, getInactiveClasses);
router.get("/getClassById/:id", adminAuthMiddleware, getClassById);

router.post("/createSubject", adminAuthMiddleware, createSubject);
router.get("/getSubjects", adminAuthMiddleware, getSubjects);
router.put("/updateSubject/:id", adminAuthMiddleware, updateSubject);
router.delete("/deleteSubject/:id", adminAuthMiddleware, deleteSubject);
router.get("/getSubjectById/:id", adminAuthMiddleware, getSubjectById);

export default router;

// http://localhost:5000/api/admin/ , this is the base url for all admin routes, so for example to create a teacher, the full url will be http://localhost:5000/api/admin/teachers