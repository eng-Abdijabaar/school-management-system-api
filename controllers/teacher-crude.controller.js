import asyncHandler from 'express-async-handler';
import Teacher from '../models/Teacher.js';
import TeachingAssignments from '../models/TeachingAssignments.js';
import Class from '../models/Class.js';
import Subject from '../models/Subject.js';
import Attendance from '../models/Attendance.js';

// @desc    Get all teacher classes
// @route   GET /api/teacher/getClasses
// @access  Private (Teacher)
export const getClasses = asyncHandler(async (req, res) => {

    const classes = await TeachingAssignments.find({
        teacherId: req.user._id,
    })
    .select('classId')
    .populate({
        path: 'classId',
        match: { isActive: true },
        select: 'class_name section room_number isActive',
    })
    .lean();

    const validClasses = classes.filter(
        cls => cls.classId !== null
    );

    if (validClasses.length === 0) {
        res.status(404);
        throw new Error('No active classes found for this teacher');
    }

    const teacher = await Teacher.findById(req.user._id)
        .select('-password')
        .lean();

    res.status(200).json({
        success: true,
        data: {
            teacher,
            classes: validClasses.map(cls => cls.classId),
        },
    });
});

// @desc    Get all teacher subjects
// @route   GET /api/teacher/getSubjects
// @access  Private (Teacher)
export const getSubjects = asyncHandler(async (req, res) => {

    const subjects = await TeachingAssignments.find({
        teacherId: req.user._id,
    })
    .select('subjectId')
    .populate({
        path: 'subjectId',
        match: { isActive: true },
        select: 'name code section weeklySessions isActive',
    })
    .lean();

    const validSubjects = subjects.filter(
        sub => sub.subjectId !== null
    );

    if (validSubjects.length === 0) {
        res.status(404);
        throw new Error('No active subjects found for this teacher');
    }

    const uniqueSubjects = [
        ...new Map(
            validSubjects.map(sub => [
                sub.subjectId._id.toString(),
                sub.subjectId,
            ])
        ).values(),
    ];

    const teacher = await Teacher.findById(req.user._id)
        .select('-password')
        .lean();

    res.status(200).json({
        success: true,
        data: {
            teacher,
            subjects: uniqueSubjects,
        },
    });
});

// @desc    Get teacher class by ID
// @route   GET /api/teacher/getClass/:id
// @access  Private (Teacher)
export const getClass = asyncHandler(async (req, res) => {

    const classData = await Class.findById(req.params.id).lean();

    if (!classData) {
        res.status(404);
        throw new Error('Class not found');
    }

    const teachingAssignments = await TeachingAssignments.find({
        teacherId: req.user._id,
        classId: req.params.id,
    })
    .select('subjectId')
    .populate({
        path: 'subjectId',
        match: { isActive: true },
    })
    .lean();

    if (teachingAssignments.length === 0) {
        res.status(404);
        throw new Error('No subjects found for this teacher in this class');
    }

    const subjects = teachingAssignments
        .map(ta => ta.subjectId)
        .filter(Boolean);

    if (subjects.length === 0) {
        res.status(404);
        throw new Error('No active subjects found');
    }

    const teacher = await Teacher.findById(req.user._id)
        .select('-password')
        .lean();

    res.status(200).json({
        success: true,
        data: {
            class: classData,
            teacher,
            subjects,
        },
    });
});

// @desc    Setup attendance
// @route   GET /api/teacher/setup-attendance:id
// @access  Private (Teacher)
export const setupAttendance = asyncHandler(async (req, res) => {

    // Teacher can teach multiple subjects in one class
    const teachingAssignments = await TeachingAssignments.find({
        teacherId: req.user._id,
        classId: req.params.id,
    })
    .select('subjectId')
    .populate({
        path: 'subjectId',
        match: { isActive: true },
        select: 'name code section weeklySessions isActive',
    })
    .lean();

    if (teachingAssignments.length === 0) {
        res.status(404);
        throw new Error('No subjects assigned to this class');
    }

    // ✅ Extract populated subjects only
    const subjects = teachingAssignments
        .map(ta => ta.subjectId)
        .filter(Boolean);

    if (subjects.length === 0) {
        res.status(404);
        throw new Error('No active subjects found for this class');
    }

    const [classData, teacher] = await Promise.all([
        Class.findOne({
            _id: req.params.id,
            isActive: true,
        })
        .select('class_name section room_number students')
        .lean(),

        Teacher.findById(req.user._id)
            .select('-password')
            .lean(),
    ]);

    if (!classData) {
        res.status(404);
        throw new Error('Class not found');
    }

    res.status(200).json({
        success: true,
        data: {
            subjects,
            class: classData,
            teacher,
        },
    });
});

// @desc    Create attendance
// @route   POST /api/teacher/create-attendance
// @access  Private (Teacher)
export const createAttendance = asyncHandler(async (req, res) => {

    const { classId, subjectId, date, attendance } = req.body;
    const teacherId = req.user._id;

    if (
        !classId ||
        !subjectId ||
        !date ||
        !Array.isArray(attendance) ||
        attendance.length === 0
    ) {
        res.status(400);
        throw new Error('Missing required fields');
    }

    const assignment = await TeachingAssignments.findOne({
        teacherId,
        classId,
        subjectId,
    });

    if (!assignment) {
        res.status(403);
        throw new Error('You are not assigned to this class and subject');
    }

    const existingAttendance = await Attendance.findOne({
        class: classId,
        subject: subjectId,
        date,
    });

    if (existingAttendance) {
        res.status(400);
        throw new Error('Attendance already created for this date');
    }

    const validStatuses = ['present', 'absent', 'late'];

    for (const record of attendance) {

        if (!validStatuses.includes(record.status)) {
            res.status(400);
            throw new Error(`Invalid attendance status: ${record.status}`);
        }
    }

    const newAttendance = await Attendance.create({
        class: classId,
        subject: subjectId,
        teacher: teacherId,
        date,
        records: attendance,
    });

    res.status(201).json({
        success: true,
        data: newAttendance,
    });
});

// @desc    Update attendance
// @route   PUT /api/teacher/update-attendance/:id
// @access  Private (Teacher)
export const updateAttendance = asyncHandler(async (req, res) => {

    const { id } = req.params;
    const { attendance } = req.body;

    if (
        !Array.isArray(attendance) ||
        attendance.length === 0
    ) {
        res.status(400);
        throw new Error('Attendance records are required');
    }

    const attendanceRecord = await Attendance.findById(id);

    if (!attendanceRecord) {
        res.status(404);
        throw new Error('Attendance record not found');
    }

    if (
        attendanceRecord.teacher.toString() !==
        req.user._id.toString()
    ) {
        res.status(403);
        throw new Error('You are not authorized to update this attendance');
    }

    const today = new Date()
        .toISOString()
        .split('T')[0];

    const attendanceDate = new Date(attendanceRecord.date)
        .toISOString()
        .split('T')[0];

    if (attendanceDate !== today) {
        res.status(403);
        throw new Error('Attendance can only be updated on the same day');
    }

    const validStatuses = ['present', 'absent', 'late'];

    for (const record of attendance) {

        if (!validStatuses.includes(record.status)) {
            res.status(400);
            throw new Error(
                `Invalid attendance status: ${record.status}`
            );
        }
    }

    attendanceRecord.records = attendance;

    await attendanceRecord.save();

    res.status(200).json({
        success: true,
        data: attendanceRecord,
    });
});

// @desc   