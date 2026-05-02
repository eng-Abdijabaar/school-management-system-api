import express from "express";
import { createTeacher, getTeachers, getTeacherById, deleteTeacher, updateTeacher, getActiveTeachers  } from "../controllers/admin-crude.controller.js";
import adminAuthMiddleware from "../middleware/adminAuthMiddleware.js";

const router = express.Router();

router.post("/createTeacher", adminAuthMiddleware, createTeacher);
router.get("/getTeachers", adminAuthMiddleware, getTeachers);
router.get("/getTeacherById/:id", adminAuthMiddleware, getTeacherById);
router.delete("/deleteTeacher/:id", adminAuthMiddleware, deleteTeacher);
router.put("/updateTeacher/:id", adminAuthMiddleware, updateTeacher);
router.get("/getActiveTeachers", adminAuthMiddleware, getActiveTeachers);
export default router;

// http://localhost:5000/api/admin/ , this is the base url for all admin routes, so for example to create a teacher, the full url will be http://localhost:5000/api/admin/teachers