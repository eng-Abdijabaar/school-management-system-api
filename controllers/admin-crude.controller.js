import asyncHandler from "express-async-handler";
import Teacher from "../models/Teacher.js";

// @desc    Create a new teacher
// @route   POST /api/admin/createTeacher
// @access  Private (Admin)
export const createTeacher = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;

  // Validate input
  if (!name || !email || !phone || !password) {
    return res.status(400).json({ message: "All fields are required" });
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
        password,
    });

    await teacher.save();
    res.status(201).json({ message: "Teacher created successfully", data: teacher });
});

// @desc    Get all teachers
// @route   GET /api/admin/getTeachers
// @access  Private (Admin)
export const getTeachers = asyncHandler(async (req, res) => {
    const teachers = await Teacher.find().select("-password");
    if (teachers.length === 0) {
        return res.status(404).json({ message: "No teachers found" });
    }
    res.status(200).json({data: teachers });
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
    // update the inly the feilds that are provided in the request body
    const teacher = await Teacher.findOne({ teacherId: req.params.id });
    if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
    }

    const { name, email, phone, profile_img, documents, isActive, password } = req.body;

    if (name) teacher.name = name;
    if (email) teacher.email = email;
    if (phone) teacher.phone = phone;
    if (password) teacher.password = password;
    if (profile_img) teacher.profile_img = profile_img;
    if (documents) teacher.documents = documents;
    if (isActive !== undefined) teacher.isActive = isActive;

    await teacher.save();
    res.status(200).json({ message: "Teacher updated successfully", teacher });
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