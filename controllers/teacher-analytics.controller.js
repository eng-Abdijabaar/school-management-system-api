import asyncHandler from "express-async-handler";
import TeachingAssignments from "../models/TeachingAssignments";
import Class from "../models/Class.js";
import Attendance from "../models/Attendance.js";
import Exam from "../models/Exam.js";
import mongoose from "mongoose";

// Academic analytics

// @desc    Get all teacher academic analytics
// @route   GET /api/teacher-academics
// @access  Private (teacher)
export const getAcademicAnalytics = asyncHandler(async (req, res) => {

    const assignments = await TeachingAssignments.find({
        teacherId: req.user._id
    })
        .populate({
            path: 'classId',
            match: { isActive: true },
            select: '_id',
        })
        .populate({
            path: 'subjectId',
            match: { isActive: true },
            select: '_id',
        })
        .lean();

    const validAssignments = assignments.filter(
        assignment =>
            assignment.classId !== null &&
            assignment.subjectId !== null
    );

    if (validAssignments.length === 0) {

        return res.status(404).json({
            success: false,
            message: 'No teaching assignments found',
            data: {
                totalClasses: 0,
                totalSubjects: 0,
                totalExams: 0,
            },
        });
    }

    const classIds = [
        ...new Set(
            validAssignments.map(
                assignment =>
                    assignment.classId._id.toString()
            )
        ),
    ];

    const subjectIds = [
        ...new Set(
            validAssignments.map(
                assignment =>
                    assignment.subjectId._id.toString()
            )
        ),
    ];

    const exams = await Exam.find({
        teacher: req.user._id,
        subject: {
            $in: subjectIds,
        },
        classId: {
            $in: classIds,
        },
    }).lean();

    res.status(200).json({
        success: true,
        message:
            'Academic analytics retrieved successfully',
        data: {
            totalClasses: classIds.length,
            totalSubjects: subjectIds.length,
            totalExams: exams.length,
        },
    });
});

/*
what we will return in the teacher's dashboard performance section we will return 
classes performance. it will be like the top 8 students that have most avrages in his total classes so each student will contain his name his avrage his class. but in our sytem the teacher can teach more than 1 subject in some classes while the others can be only one subject so the question is can that effect the average?
subjects performance. it will be like the top 8 students that have most attendaces and avrage points in his total subjects so each student will contain his name his attendance his avrage points and his class.
attendance performance. the attendance will contain the top 8 subjects and those have the most attendance rates
exams performance. the top 8 classes and subjects those have the most average of exams
*/

//Teacher's academic performance

// @desc    Get  Teacher Top Students
// @route   GET /api/getTeacherTopStudents
// @access  Private (Teacher)
export const getTeacherTopStudents = asyncHandler(async (req, res) => {

    const teacherId = req.user._id;

    const performance = await Exam.aggregate([
        // 1. Get only this teacher exams
        {
            $match: {
                teacher: teacherId,
            },
        },
        // 2. Break exam results array
        {
            $unwind: '$results',
        },
        // 3. Group by student + subject
        //    to calculate subject average first
        {
            $group: {

                _id: {
                    student: '$results.student',
                    subject: '$subject',
                    classId: '$classId',
                },

                averagePerSubject: {
                    $avg: '$results.marks_obtained',
                },
            },
        },
        // 4. Group again by student
        //    to calculate overall average
        {
            $group: {

                _id: '$_id.student',

                overallAverage: {
                    $avg: '$averagePerSubject',
                },

                classId: {
                    $first: '$_id.classId',
                },
            },
        },
        // 5. Lookup student info
        {
            $lookup: {
                from: 'students',
                localField: '_id',
                foreignField: '_id',
                as: 'student',
            },
        },
        // 6. Convert student array to object
        {
            $unwind: '$student',
        },
        // 7. Lookup class info
        {
            $lookup: {
                from: 'classes',
                localField: 'classId',
                foreignField: '_id',
                as: 'class',
            },
        },
        // 8. Convert class array to object
        {
            $unwind: '$class',
        },
        // 9. Sort highest averages first
        {
            $sort: {
                overallAverage: -1,
            },
        },
        // 10. Top 8 students
        {
            $limit: 8,
        },
        // 11. Final response shape
        {
            $project: {
                _id: 0,
                studentId: '$student._id',
                studentName: '$student.name',
                studentCode: '$student.studentId',
                class: {
                    _id: '$class._id',
                    class_name: '$class.class_name',
                    section: '$class.section',
                },
                overallAverage: {
                    $round: ['$overallAverage', 2],
                },
            },
        },
    ]);

    if (!performance.length) {
        return res.status(200).json({
            success: true,
            message: 'No performance data available yet',
            data: [],
        });
    }

    res.status(200).json({
        success: true,
        message: 'Classes performance retrieved successfully',
        data: performance,
    });
});

// @desc    Get teacher top student attendance
// @route   GET /api/getTeacherTopStudentsAttendance
// @access  Private (Teacher)
export const getTeacherTopStudentsAttendance = asyncHandler(async (req, res) => {

    const teacherId = req.user._id;

    const topStudents = await Attendance.aggregate([
        // Only this teacher's attendance
        {
            $match: {
                teacher: teacherId,
            },
        },
        // One document per attendance record
        {
            $unwind: '$records',
        },
        // Group by student
        {
            $group: {

                _id: '$records.student',

                totalSessions: {
                    $sum: 1,
                },

                totalPresent: {
                    $sum: {
                        $cond: [
                            {
                                $eq: [
                                    '$records.status',
                                    'present',
                                ],
                            },
                            1,
                            0,
                        ],
                    },
                },

                totalAbsent: {
                    $sum: {
                        $cond: [
                            {
                                $eq: [
                                    '$records.status',
                                    'absent',
                                ],
                            },
                            1,
                            0,
                        ],
                    },
                },

                totalLate: {
                    $sum: {
                        $cond: [
                            {
                                $eq: [
                                    '$records.status',
                                    'late',
                                ],
                            },
                            1,
                            0,
                        ],
                    },
                },
            },
        },
        // Calculate attendance %
        {
            $addFields: {
                attendancePercentage: {
                    $multiply: [
                        {
                            $divide: [
                                '$totalPresent',
                                '$totalSessions',
                            ],
                        },
                        100,
                    ],
                },
            },
        },
        // Get student information
        {
            $lookup: {
                from: 'students',
                localField: '_id',
                foreignField: '_id',
                as: 'student',
            },
        },

        {
            $unwind: '$student',
        },
        // Sort highest attendance first
        {
            $sort: {
                attendancePercentage: -1,
            },
        },
        // Top 10
        {
            $limit: 8,
        },

        // Final response
        {
            $project: {

                _id: 0,

                studentId: '$student._id',

                studentName: '$student.name',

                studentCode: '$student.studentId',

                totalSessions: 1,

                totalPresent: 1,

                totalAbsent: 1,

                totalLate: 1,

                attendancePercentage: {
                    $round: [
                        '$attendancePercentage',
                        2,
                    ],
                },
            },
        },
    ]);

    res.status(200).json({
        success: true,
        message:
            'Top students attendance retrieved successfully',
        data: topStudents,
    });

});

// Charts Data

// @desc    Get attendance overview
// @route   GET /api/teacher/attendance-overview
// @access  Private (Teacher)
export const getAttendanceOverview = asyncHandler(async (req, res) => {

    const teacherId = req.user._id;

    const assignments = await TeachingAssignments.find({ teacherId })
        .populate({
            path: 'classId',
            match: { isActive: true },
            select: '_id',
        });

    const validClassIds = assignments
        .map((assignment) => assignment.classId?._id)
        .filter((id) => id !== undefined);

    const classIds = [
        ...new Set(
            validClassIds.map(id => id.toString())
        )
    ].map(id => new mongoose.Types.ObjectId(id));

    if (classIds.length === 0) {
        return res.status(200).json({
            success: true,
            data: {
                totalPresent: 0,
                totalAbsent: 0,
                totalLate: 0,
                totalRecords: 0,
                presentPercentage: 0,
                absentPercentage: 0,
                latePercentage: 0,
            }
        });
    }

    const overview = await Attendance.aggregate([

        {
            $match: {
                teacher: teacherId,
                class: { $in: classIds }
            },
        },

        {
            $unwind: '$records',
        },

        {
            $group: {
                _id: null,

                totalPresent: {
                    $sum: {
                        $cond: [
                            {
                                $eq: [
                                    '$records.status',
                                    'present',
                                ],
                            },
                            1,
                            0,
                        ],
                    },
                },

                totalAbsent: {
                    $sum: {
                        $cond: [
                            {
                                $eq: [
                                    '$records.status',
                                    'absent',
                                ],
                            },
                            1,
                            0,
                        ],
                    },
                },

                totalLate: {
                    $sum: {
                        $cond: [
                            {
                                $eq: [
                                    '$records.status',
                                    'late',
                                ],
                            },
                            1,
                            0,
                        ],
                    },
                },
            },
        },

        {
            $addFields: {
                totalRecords: {
                    $add: [
                        '$totalPresent',
                        '$totalAbsent',
                        '$totalLate',
                    ],
                },
            },
        },

        {
            $project: {
                _id: 0,

                totalPresent: 1,
                totalAbsent: 1,
                totalLate: 1,
                totalRecords: 1,

                presentPercentage: {
                    $cond: [
                        { $eq: ['$totalRecords', 0] },
                        0,
                        {
                            $round: [
                                {
                                    $multiply: [
                                        {
                                            $divide: [
                                                '$totalPresent',
                                                '$totalRecords',
                                            ],
                                        },
                                        100,
                                    ],
                                },
                                2,
                            ],
                        },
                    ],
                },

                absentPercentage: {
                    $cond: [
                        { $eq: ['$totalRecords', 0] },
                        0,
                        {
                            $round: [
                                {
                                    $multiply: [
                                        {
                                            $divide: [
                                                '$totalAbsent',
                                                '$totalRecords',
                                            ],
                                        },
                                        100,
                                    ],
                                },
                                2,
                            ],
                        }
                    ],
                },

                latePercentage: {
                    $cond: [
                        { $eq: ['$totalRecords', 0] },
                        0,
                        {
                            $round: [
                                {
                                    $multiply: [
                                        {
                                            $divide: [
                                                '$totalLate',
                                                '$totalRecords',
                                            ],
                                        },
                                        100,
                                    ],
                                },
                                2,
                            ],
                        }
                    ],
                },
            },
        },
    ]);

    const data = overview[0] || {
        totalPresent: 0,
        totalAbsent: 0,
        totalLate: 0,
        totalRecords: 0,
        presentPercentage: 0,
        absentPercentage: 0,
        latePercentage: 0,
    };

    res.status(200).json({
        success: true,
        message: 'Attendance overview retrieved successfully',
        data,
    });
});

// @desc    Get classes performance overview
// @route   GET /api/teacher/classes-performance-overview
// @access  Private (Teacher)
export const getClassesPerformanceOverview = asyncHandler(async (req, res) => {
    const teacherId = req.user._id;

    const assignments = await TeachingAssignments.find({ teacherId })
        .populate({
            path: 'classId',
            match: { isActive: true },
            select: '_id'
        });

    const validAssignments = assignments.filter(assignment => assignment.classId !== null);

    const classIds = [
        ...new Set(
            validAssignments.map(assignment => assignment.classId._id.toString())
        )
    ].map(id => new mongoose.Types.ObjectId(id));

    if (classIds.length === 0) {
        return res.status(200).json({
            success: true,
            message: 'No active classes found',
            data: [],
        });
    }

    const overview = await Exam.aggregate([
        {
            $match: {
                teacher: teacherId,
                classId: { $in: classIds },
            },
        },

        // Keep exams even if results is empty
        {
            $unwind: {
                path: '$results',
                preserveNullAndEmptyArrays: true,
            },
        },

        {
            $group: {
                _id: '$classId',

                totalMarksObtained: {
                    $sum: {
                        $ifNull: [
                            '$results.marks_obtained',
                            0,
                        ],
                    },
                },

                totalPossibleMarks: {
                    $sum: {
                        $cond: [
                            {
                                $ifNull: [
                                    '$results.student',
                                    false,
                                ],
                            },
                            '$total_marks',
                            0,
                        ],
                    },
                },

                totalSubmissions: {
                    $sum: {
                        $cond: [
                            {
                                $ifNull: [
                                    '$results.student',
                                    false,
                                ],
                            },
                            1,
                            0,
                        ],
                    },
                },
            },
        },

        {
            $lookup: {
                from: 'classes',
                localField: '_id',
                foreignField: '_id',
                as: 'class',
            },
        },

        {
            $unwind: '$class',
        },

        {
            $project: {
                _id: 0,

                classId: '$class._id',
                className: '$class.class_name',
                section: '$class.section',

                label: {
                    $concat: [
                        '$class.class_name',
                        ' ',
                        '$class.section',
                    ],
                },

                totalMarksObtained: 1,
                totalPossibleMarks: 1,
                totalSubmissions: 1,

                averagePercentage: {
                    $cond: [
                        {
                            $eq: [
                                '$totalPossibleMarks',
                                0,
                            ],
                        },
                        0,
                        {
                            $round: [
                                {
                                    $multiply: [
                                        {
                                            $divide: [
                                                '$totalMarksObtained',
                                                '$totalPossibleMarks',
                                            ],
                                        },
                                        100,
                                    ],
                                },
                                2,
                            ],
                        },
                    ],
                },
            },
        },

        {
            $sort: {
                averagePercentage: -1,
            },
        },
    ]);


    res.status(200).json({
        success: true,
        message: 'Classes performance overview retrieved successfully',
        data: overview,
    });
});

