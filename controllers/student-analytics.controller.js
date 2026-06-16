import asyncHandler from 'express-async-handler';
import Attendance from '../models/Attendance.js';

// Student Analytics Controller

// @desc    Get student attendance analytics
// @route   GET /api/student/student-analytics
// @access  Private (Student)
export const getStudentAttendanceAnalytics = asyncHandler(async (req, res) => {

    const analytics = await Attendance.aggregate([
        {
            $unwind: {
                path: '$records',
                preserveNullAndEmptyArrays: false,
            },
        },

        {
            $match: {
                'records.student': req.user._id,
            },
        },

        {
            $group: {
                _id: null,

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
            $project: {
                _id: 0,

                totalSessions: 1,
                totalPresent: 1,
                totalAbsent: 1,
                totalLate: 1,

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
                            $round: [
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
                                2,
                            ],
                        },
                    ],
                },
            },
        },
    ]);

    const data = analytics[0] ?? {
        totalSessions: 0,
        totalPresent: 0,
        totalAbsent: 0,
        totalLate: 0,
        attendancePercentage: 0,
    };

    res.status(200).json({
        success: true,
        message: 'Student attendance analytics retrieved successfully',
        data,
    });
});
