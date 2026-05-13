import asyncHandler from "express-async-handler";
import Teacher from "../models/Teacher.js";
import Student from "../models/Student.js";
import TeachingAssignment from "../models/TeachingAssignments.js";
import Class from "../models/Class.js";
import Subject from "../models/Subject.js";

// @desc    Create a new teacher
// @route   POST /api/admin/createTeacher
// @access  Private (Admin)
export const createTeacher = asyncHandler(async (req, res) => {
    const { name, email, phone, salary, password } = req.body;

    // Validate input
    if (!name || !email || !phone || !password || !salary) {
        res.status(400);
        throw new Error("all feilds are required")
    }

    // Check if teacher already exists
    const existingTeacher = await Teacher.findOne({ $or: [{ email }, { phone }] });
    if (existingTeacher) {
        return res.status(400).json({ message: "Teacher with this email or phone already exists" });
    }

    const teacher = new Teacher({
        name,
        email,
        phone,
        salary,
        password,
    });

    await teacher.save();
    res.status(201).json({ message: "Teacher created successfully", data: {
        name: teacher.name,
        email:teacher.email,
        phone:teacher.phone,
        documents:teacher.documents,
        salary: teacher.salary,
        isActive: teacher.isActive,
        _id: teacher._id,
        teacherId: teacher.teacherId,
        createdAt: teacher.createdAt
    } });
});

// @desc    Get all teachers
// @route   GET /api/admin/getTeachers
// @access  Private (Admin)
export const getTeachers = asyncHandler(async (req, res) => {
    const teachers = await Teacher.find().select("-password");
    if (teachers.length === 0) {
        return res.status(404).json({ message: "No teachers found" });
    }
    res.status(200).json({ data: teachers });
});

// @desc    Get a teacher by ID
// @route   GET /api/admin/getTeacherById/:id
// @access  Private (Admin)
export const getTeacherById = asyncHandler(async (req, res) => {
    const teacher = await Teacher.findOne({ teacherId: req.params.id }).select("-password");
    if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
    }
    res.status(200).json({ data: teacher });
});

// @desc    Delete a teacher by ID
// @route   DELETE /api/admin/deleteTeacher/:id
// @access  Private (Admin)
export const deleteTeacher = asyncHandler(async (req, res) => {
    const teacher = await Teacher.findOne({ teacherId: req.params.id });
    if (!teacher) {
        res.status(404);
        throw new Error('Teacher not found');
    }
    await teacher.deleteOne();
    res.status(200).json({ message: "Teacher deleted successfully" });
});

// @desc    Update a teacher by ID
// @route   PUT /api/admin/updateTeacher/:id
// @access  Private (Admin)
export const updateTeacher = asyncHandler(async (req, res) => {
    // update only the fields that are provided in the request body
    const teacher = await Teacher.findOne({ teacherId: req.params.id }).select("-password");
    if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
    }

    const { name, email, phone, salary, profile_img, documents, isActive, password } = req.body;

    if (name) teacher.name = name;
    if (email) teacher.email = email;
    if (phone) teacher.phone = phone;
    if (salary) teacher.salary = salary;
    if (password) teacher.password = password;
    if (profile_img) teacher.profile_img = profile_img;
    if (documents) teacher.documents = documents;
    if (isActive !== undefined) teacher.isActive = isActive;

    await teacher.save();
    res.status(200).json({
        message: "Teacher updated successfully", 
        data: teacher
    });
});

// @desc    Get all active teachers
// @route   GET /api/admin/getActiveTeachers
// @access  Private (Admin)
export const getActiveTeachers = asyncHandler(async (req, res) => {
    const teachers = await Teacher.find({ isActive: true }).select("-password");
    if (teachers.length === 0) {
        return res.status(404).json({ message: "No active teachers found" });
    }
    res.status(200).json({ data: teachers, message: "Active teachers retrieved successfully" });
});

// @desc    Get all inactive teachers
// @route   GET /api/admin/getInactiveTeachers
// @access  Private (Admin) 
export const getInactiveTeachers = asyncHandler(async (req, res) => {
    const teachers = await Teacher.find({ isActive: false }).select("-password");
    if (teachers.length === 0) {
        return res.status(404).json({ message: "No inactive teachers found" });
    }
    res.status(200).json({ data: teachers, message: "Inactive teachers retrieved successfully" });
});

// @desc    Create a new student
// @route   POST /api/admin/createStudent
// @access  Private (Admin)
export const createStudent = asyncHandler(async (req, res) => {
    const { name, email, phone, parent_number, section, password } = req.body;

    // Validate input email is not required for student but other fields are required
    if (!name || !phone || !parent_number || !section || !password) {
        res.status(400);
        throw new Error("Name, phone, parent number, section, and password are required");
    }

    // Check if student already exists
    const existingStudent = await Student.findOne({ phone });
    if (existingStudent) {
        res.status(400);
        throw new Error("Student with this phone already exists");
    }

    const student = new Student({
        name,
        phone,
        parent_number,
        section,
        password,
    });

    if (email) {
        student.email = email;
    }


    await student.save();
    res.status(201).json({
        message: "Student created successfully", data: {
            name: student.name,
            email: student.email || null,
            studentId: student.studentId,
            phone: student.phone,
            parent_number: student.parent_number,
            section,
            isActive: student.isActive,
        }
    });
});

// @desc    Get all students
// @route   GET /api/admin/getStudents
// @access  Private (Admin)
export const getStudents = asyncHandler(async (req, res) => {
    const students = await Student.find().select("-password");
    if (students.length === 0) {
        return res.status(404).json({ message: "No students found" });
    }
    res.status(200).json({ message: "Students retrieved successfully", data: students });
});

// @desc    Get a student by ID
// @route   GET /api/admin/getStudentById/:id
// @access  Private (Admin)
export const getStudentById = asyncHandler(async (req, res) => {
    const student = await Student.findOne({ studentId: req.params.id }).select("-password");
    if (!student) {
        return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json({ message: "Student retrieved successfully", data: student });
});

// @desc    Get students by section
// @route   GET /api/admin/getStudentsBySection/:section
// @access  Private (Admin)
export const getStudentsBySection = asyncHandler(async (req, res) => {
    const { section } = req.params;

    const students = await Student.find({ section })
        .select('-password')
        .lean();

    if (students.length === 0) {
        res.status(404);
        throw new Error('No students found for this section');
    }

    res.status(200).json({
        success: true,
        message: `Students retrieved successfully for section ${section}`,
        data: students,
    });
});

// @desc    Delete a student by ID
// @route   DELETE /api/admin/deleteStudent/:id
// @access  Private (Admin)
export const deleteStudent = asyncHandler(async (req, res) => {
    const student = await Student.findOne({ studentId: req.params.id });
    if (!student) {
        return res.status(404).json({ message: "Student not found" });
    }
    await student.deleteOne();
    res.status(200).json({ message: "Student deleted successfully" });
});

// @desc    Update a student by ID
// @route   PUT /api/admin/updateStudent/:id
// @access  Private (Admin)
export const updateStudent = asyncHandler(async (req, res) => {
    const student = await Student.findOne({ studentId: req.params.id });
    if (!student) {
        return res.status(404).json({ message: "Student not found" });
    }

    const { name, email, phone, parent_number, section, profile_img, documents, isActive, password } = req.body;

    if (name) student.name = name;
    if (email) student.email = email;
    if (phone) student.phone = phone;
    if (parent_number) student.parent_number = parent_number;
    if (section) student.section = section;
    if (profile_img) student.profile_img = profile_img;
    if (documents) student.documents = documents;
    if (isActive !== undefined) student.isActive = isActive;

    await student.save();
    res.status(200).json({ message: "Student updated successfully", data: student });
});

// @desc    Get all active students
// @route   GET /api/admin/getActiveStudents
// @access  Private (Admin)
export const getActiveStudents = asyncHandler(async (req, res) => {
    const students = await Student.find({ isActive: true }).select("-password");
    if (students.length === 0) {
        return res.status(404).json({ message: "No active students found" });
    }
    res.status(200).json({ message: "Active students retrieved successfully", data: students });
});

// @desc    Get all inactive students
// @route   GET /api/admin/getInactiveStudents
// @access  Private (Admin)
export const getInactiveStudents = asyncHandler(async (req, res) => {
    const students = await Student.find({ isActive: false }).select("-password");
    if (students.length === 0) {
        return res.status(404).json({ message: "No inactive students found" });
    }
    res.status(200).json({ message: "Inactive students retrieved successfully", data: students });
});


// @desc  Get student password by ID
// @route GET /api/admin/getStudentPassword/:id
// @access Private (Admin)
export const getStudentPassword = asyncHandler(async (req, res) => {
    const student = await Student.findOne({ studentId: req.params.id });
    if (!student) {
        return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json({
        message: "Student password retrieved successfully", data: {
            studentId: student.studentId,
            studentName: student.name,
            password: student.password
        }
    });
});

// @desc Create a new class
// @route POST /api/admin/createClass
// @access Private (Admin)
export const createClass = asyncHandler(async (req, res) => {
    const { class_name, section, room_number, capacity, students = [] } = req.body;

    // Validate input
    if (!class_name || !section || !room_number || !capacity) {
        res.status(400);
        throw new Error('Class name, section, room number, and capacity are required');
    }

    // Create class
    const newClass = await Class.create({
        class_name,
        section,
        room_number,
        capacity,
        students,
    });

    res.status(201).json({
        success: true,
        message: 'Class created successfully',
        data: newClass,
    });
});

// @desc Get all classes
// @route GET /api/admin/getClasses
// @access Private (Admin)
export const getClasses = asyncHandler(async (req, res) => {
    const classes = await Class.find();
    if (classes.length === 0) {
        return res.status(404).json({ message: "No classes found" });
    }
    res.status(200).json({ message: "Classes retrieved successfully", data: classes });
});

// @desc Update a class by ID
// @route PUT /api/admin/updateClass/:id
// @access Private (Admin)
export const updateClass = asyncHandler(async (req, res) => {
    const classToUpdate = await Class.findById(req.params.id);
    if (!classToUpdate) {
        return res.status(404).json({ message: "Class not found" });
    }

    const { class_name, section, room_number, isActive } = req.body;

    if (class_name) classToUpdate.class_name = class_name;
    if (section) classToUpdate.section = section;
    if (room_number) classToUpdate.room_number = room_number;
    if (isActive !== undefined) classToUpdate.isActive = isActive;

    await classToUpdate.save();
    res.status(200).json({ message: "Class updated successfully", data: classToUpdate });
});

// @desc Delete a class by ID
// @route DELETE /api/admin/deleteClass/:id
// @access Private (Admin)  
export const deleteClass = asyncHandler(async (req, res) => {
    const classToDelete = await Class.findById(req.params.id);
    if (!classToDelete) {
        return res.status(404).json({ message: "Class not found" });
    }
    await classToDelete.deleteOne();
    res.status(200).json({ message: "Class deleted successfully" });
});

// @desc Get active classes
// @route GET /api/admin/getActiveClasses
// @access Private (Admin)
export const getActiveClasses = asyncHandler(async (req, res) => {
    const classes = await Class.find({ isActive: true });
    if (classes.length === 0) {
        return res.status(404).json({ message: "No active classes found" });
    }
    res.status(200).json({ message: "Active classes retrieved successfully", data: classes });
});

// @desc Get inactive classes
// @route GET /api/admin/getInactiveClasses
// @access Private (Admin)
export const getInactiveClasses = asyncHandler(async (req, res) => {
    const classes = await Class.find({ isActive: false });
    if (classes.length === 0) {
        return res.status(404).json({ message: "No inactive classes found" });
    }
    res.status(200).json({ message: "Inactive classes retrieved successfully", data: classes });
});

// @desc Get class by ID
// @route GET /api/admin/getClassById/:id
// @access Private (Admin)
export const getClassById = asyncHandler(async (req, res) => {
    const classToGet = await Class.findById(req.params.id).lean();

    if (!classToGet) {
        res.status(404);
        throw new Error('Class not found');
    }

    const [students, assignments] = await Promise.all([
        Student.find({ _id: { $in: classToGet.students } })
            .select('-password')
            .lean(),

        TeachingAssignment.find({ classId: classToGet._id })
            .select('teacherId subjectId')
            .lean(),
    ]);

    // Extract unique teacher + subject IDs
    const teacherIds = [...new Set(assignments.map(a => a.teacherId.toString()))];
    const subjectIds = [...new Set(assignments.map(a => a.subjectId.toString()))];

    const [teachers, subjects] = await Promise.all([
        Teacher.find({ _id: { $in: teacherIds } })
            .select('-password')
            .lean(),

        Subject.find({ _id: { $in: subjectIds } }).lean(),
    ]);

    res.status(200).json({
        success: true,
        data: {
            class_name: classToGet.class_name,
            section: classToGet.section,
            room_number: classToGet.room_number,
            isActive: classToGet.isActive,
            students,
            teachers,
            subjects,
        },
    });
});

// @desc    Get classes by section
// @route   GET /api/admin/getClassesBySection/:section
// @access  Private (Admin)
export const getClassesBySection = asyncHandler(async (req, res) => {
    const { section } = req.params;

    const classes = await Class.find({ section }).lean();

    if (classes.length === 0) {
        res.status(404);
        throw new Error('No classes found for this section');
    }

    res.status(200).json({
        success: true,
        message: `classes retrieved successfully for section ${section}`,
        data: classes,
    });
});

// @desc Remove student from a class
// @route put /api/admin/removeStudent/:id
// @access Private (Admin)
export const removeStudent = asyncHandler(async (req, res) => { });

// @desc Create a new subject
// @route POST /api/admin/createSubject
// @access Private (Admin)
export const createSubject = asyncHandler(async (req, res) => {
    const { name, description, section, weeklySessions } = req.body;
    if (!name || !section || !weeklySessions) {
        res.status(400);
        throw new Error("all fields are required");
    }

    const createdSubject = new Subject({
        name,
        description,
        section,
        weeklySessions,
    });
    await createdSubject.save();
    res.status(201).json({ message: "Subject created successfully", data: createdSubject });
});

// @desc Get all subjects
// @route GET /api/admin/getSubjects
// @access Private (Admin)
export const getSubjects = asyncHandler(async (req, res) => {
    const subjects = await Subject.find();
    if (subjects.length === 0) {
        return res.status(404);
        throw new Error("No subjects found");
    }
    res.status(200).json({ message: "Subjects retrieved successfully", data: subjects });
});

// @desc Update a subject by ID
// @route PUT /api/admin/updateSubject/:id
// @access Private (Admin)
export const updateSubject = asyncHandler(async (req, res) => {
    const { name, description, section, weeklySessions } = req.body;
    const subjectToUpdate = await Subject.findById(req.params.id);
    if (!subjectToUpdate) {
        return res.status(404).json({ message: "Subject not found" });
    }
    if (name) subjectToUpdate.name = name
    if (description) subjectToUpdate.description = description
    if (section) subjectToUpdate.section = section
    if (weeklySessions) subjectToUpdate.weeklySessions = weeklySessions

    await subjectToUpdate.save();
    res.status(200).json({ message: "Subject updated successfully", data: subjectToUpdate });
});

// @desc Delete a subject by ID
// @route DELETE /api/admin/deleteSubject/:id
// @access Private (Admin)
export const deleteSubject = asyncHandler(async (req, res) => {
    const subjectToDelete = await Subject.findById(req.params.id);
    if (!subjectToDelete) {
        return res.status(404).json({ message: "Subject not found" });
    }
    await subjectToDelete.deleteOne();
    res.status(200).json({ message: "Subject deleted successfully" });
});

// @desc Get subject by ID
// @route GET /api/admin/getSubjectById/:id
// @access Private (Admin)
export const getSubjectById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const subject = await Subject.findById(id);
    if (!subject) {
        res.status(404);
        throw new Error("Subject not found");
    }

    const assignments = await TeachingAssignment.find({ subjectId: id })
        .populate({
            path: "classId",
            match: { isActive: true },
            select: "name isActive"
        })
        .populate({
            path: "teacherId",
            select: "name"
        });

    const validAssignments = assignments.filter(a => a.classId !== null);
    const classesMap = new Map();
    validAssignments.forEach(a => {
        classesMap.set(a.classId._id.toString(), a.classId);
    });
    const classes = Array.from(classesMap.values());

    const teachersMap = new Map();
    validAssignments.forEach(a => {
        teachersMap.set(a.teacherId._id.toString(), a.teacherId);
    });

    const teachers = Array.from(teachersMap.values());

    res.json({
        message: "Subject retrieved successfully",
        data: {
            subject,
            classes,
            teachers
        }
    });
});

// @desc    Get subjects by section
// @route   GET /api/admin/getSubjectsBySection/:section
// @access  Private (Admin)
export const getSubjectsBySection = asyncHandler(async (req, res) => {
    const { section } = req.params;

    const subjects = await Subject.find({ section }).lean();

    if (subjects.length === 0) {
        res.status(404);
        throw new Error('No subjects found for this section');
    }

    res.status(200).json({
        success: true,
        message: `subjects retrieved successfully for section ${section}`,
        data: subjects,
    });
});

// @desc Assign a subject to a class with a teacher
// @route POST /api/admin/assignSubject
// @access Private (Admin)
export const assignSubject = asyncHandler(async (req, res) => {
    const { classId, assignments } = req.body; // assignments is an array of { teacherId, subjectId }
    const dataToInsert = assignments.map(a => ({
        classId,
        teacherId: a.teacherId,
        subjectId: a.subjectId
    }));
    await TeachingAssignment.insertMany(dataToInsert);
    res.status(200).json({ message: "Subject assigned to class successfully" });
});

// @desc remove a subject from a class
// @route POST /api/admin/removeSubject
// @access Private (Admin)
export const removeSubject = asyncHandler(async (req, res) => {
    const { classId, subjectId } = req.body;
    const subjectToRemove = await TeachingAssignment.findOne({ classId, subjectId });
    if (!subjectToRemove) {
        return res.status(404);
        throw new Error("Subject is not found for this class");
    }
    await subjectToRemove.deleteOne();
    res.status(200).json({ message: "Subject removed from class successfully", data: subjectToRemove });
});