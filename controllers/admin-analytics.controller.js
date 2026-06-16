import asyncHandler from "express-async-handler";
import TeachingAssignments from "../models/TeachingAssignments.js";
import Class from "../models/Class.js";
import Attendance from "../models/Attendance.js";
import Exam from "../models/Exam.js";
import Subject from "../models/Subject.js";
import Teacher from "../models/Teacher.js";
import Student from "../models/Student.js";

// @desc    Get admin dashboard analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin)
export const getAdminAnalytics = asyncHandler(async (req, res) => {

    const [
        totalStudents,
        totalTeachers,
        totalClasses,
        totalSubjects,
        totalExams,
        totalAttendance,
    ] = await Promise.all([
        Student.countDocuments({ isActive: true }),
        Teacher.countDocuments({ isActive: true }),
        Class.countDocuments({ isActive: true }),
        Subject.countDocuments({ isActive: true }),
        Exam.countDocuments(),
        Attendance.countDocuments(),
    ]);

    res.status(200).json({
        success: true,
        message: 'Admin analytics retrieved successfully',
        data: {
            totalStudents,
            totalTeachers,
            totalClasses,
            totalSubjects,
            totalExams,
            totalAttendance,
        },
    });

});

// charts data for admin dashboard

// @desc    Get students per class
// @route   GET /api/admin/analytics/students-per-class
// @access  Private (Admin)
export const getStudentsPerClass = asyncHandler(async (req, res) => {

    const studentsPerClass = await Class.aggregate([
        {
            $match: {
                isActive: true,
            },
        },

        {
            $project: {
                _id: 1,
                class_name: 1,
                section: 1,

                studentCount: {
                    $size: {
                        $ifNull: ["$students", []],
                    },
                },
            },
        },

        {
            $sort: {
                studentCount: -1,
            },
        },
    ]);

    res.status(200).json({
        success: true,
        message: "Students per class retrieved successfully",
        data: studentsPerClass,
    });
});

// @desc    Get attendance overview
// @route   GET /api/admin/analytics/attendance-overview
// @access  Private (Admin)
export const getAttendanceOverview = asyncHandler(async (req, res) => {

    // 1. Get active class IDs
    const classIds = await Class.find({ isActive: true }).distinct("_id");

    if (!classIds.length) {
        return res.status(200).json({
            success: true,
            message: "Attendance overview retrieved successfully",
            data: {
                totalPresent: 0,
                totalAbsent: 0,
                totalLate: 0,
                totalRecords: 0,
                attendanceSessions: 0,
                presentPercentage: 0,
                absentPercentage: 0,
                latePercentage: 0,
            }
        });
    }

    // 2. Aggregation
    const overview = await Attendance.aggregate([
        {
            $match: {
                class: { $in: classIds }
            }
        },

        {
            $unwind: {
                path: "$records",
                preserveNullAndEmptyArrays: false
            }
        },

        {
            $group: {
                _id: null,

                totalPresent: {
                    $sum: {
                        $cond: [
                            { $eq: ["$records.status", "present"] },
                            1,
                            0
                        ]
                    }
                },

                totalAbsent: {
                    $sum: {
                        $cond: [
                            { $eq: ["$records.status", "absent"] },
                            1,
                            0
                        ]
                    }
                },

                totalLate: {
                    $sum: {
                        $cond: [
                            { $eq: ["$records.status", "late"] },
                            1,
                            0
                        ]
                    }
                },

                attendanceSessions: {
                    $addToSet: "$_id"
                }
            }
        },

        {
            $addFields: {
                totalRecords: {
                    $add: [
                        "$totalPresent",
                        "$totalAbsent",
                        "$totalLate"
                    ]
                },

                attendanceSessions: {
                    $size: "$attendanceSessions"
                }
            }
        },

        {
            $project: {
                _id: 0,

                totalPresent: 1,
                totalAbsent: 1,
                totalLate: 1,
                totalRecords: 1,
                attendanceSessions: 1,

                presentPercentage: {
                    $cond: [
                        { $eq: ["$totalRecords", 0] },
                        0,
                        {
                            $round: [
                                {
                                    $multiply: [
                                        { $divide: ["$totalPresent", "$totalRecords"] },
                                        100
                                    ]
                                },
                                2
                            ]
                        }
                    ]
                },

                absentPercentage: {
                    $cond: [
                        { $eq: ["$totalRecords", 0] },
                        0,
                        {
                            $round: [
                                {
                                    $multiply: [
                                        { $divide: ["$totalAbsent", "$totalRecords"] },
                                        100
                                    ]
                                },
                                2
                            ]
                        }
                    ]
                },

                latePercentage: {
                    $cond: [
                        { $eq: ["$totalRecords", 0] },
                        0,
                        {
                            $round: [
                                {
                                    $multiply: [
                                        { $divide: ["$totalLate", "$totalRecords"] },
                                        100
                                    ]
                                },
                                2
                            ]
                        }
                    ]
                }
            }
        }
    ]);

    const data = overview[0] || {
        totalPresent: 0,
        totalAbsent: 0,
        totalLate: 0,
        totalRecords: 0,
        attendanceSessions: 0,
        presentPercentage: 0,
        absentPercentage: 0,
        latePercentage: 0,
    };

    return res.status(200).json({
        success: true,
        message: "Attendance overview retrieved successfully",
        data
    });
});

// @desc    Get classes performance overview
// @route   GET /api/admin/classes-performance-overview
// @access  Private (Admin)
export const getClassesPerformanceOverview = asyncHandler(async (req, res) => {

    // 1. Get active class IDs
    const classIds = await Class.find({ isActive: true }).distinct("_id");

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
                classId: { $in: classIds },
            },
        },

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

// @desc    Get academic top student attendance
// @route   GET /api/admin/analytics/top-students-attendance
// @access  Private (Admin)
export const getAcademicTopStudentsAttendance = asyncHandler(async (req, res) => {

    const classIds = await Class.find({
        isActive: true,
    }).distinct('_id');

    if (classIds.length === 0) {
        return res.status(200).json({
            success: true,
            message: 'No active classes found',
            data: [],
        });
    }

    const topStudents = await Attendance.aggregate([
        {
            $match: {
                class: {
                    $in: classIds,
                },
            },
        },

        {
            $unwind: '$records',
        },

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

        {
            $addFields: {
                attendancePercentage: {
                    $cond: [
                        {
                            $eq: [
                                '$totalSessions',
                                0,
                            ],
                        },
                        0,
                        {
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
                    ],
                },
            },
        },

        {
            $lookup: {
                from: 'students',
                localField: '_id',
                foreignField: '_id',
                pipeline: [
                    {
                        $match: {
                            isActive: true,
                        },
                    },
                ],
                as: 'student',
            },
        },

        {
            $unwind: '$student',
        },

        {
            $sort: {
                attendancePercentage: -1,
                totalPresent: -1,
                totalSessions: -1,
            },
        },

        {
            $limit: 8,
        },

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
        message: 'Top students attendance retrieved successfully',
        data: topStudents,
    });

});