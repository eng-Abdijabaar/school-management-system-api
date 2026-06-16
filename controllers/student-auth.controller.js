import asyncHandler from 'express-async-handler';
import Student from '../models/Student.js';
import generateToken from '../utils/generateToken.js';

// @desc    Login student
// @route   POST /api/students/login
// @access  Public
export const loginStudent = asyncHandler(async (req, res) => {
    const { studentID, password } = req.body;
    
    // check the input data
    if (!studentID || !password) {
        res.status(400);
        throw new Error('Please provide student ID and password');
    }
    
    // check if student exists
    const student = await Student.findOne({ studentID });
    if (!student) {
        res.status(401);
        throw new Error('Invalid student ID or password');
    }

    // check if the password is correct
    const isPasswordCorrect = student.password === password;

    if (!isPasswordCorrect) {
        res.status(401);
        throw new Error('Invalid student ID or password');
    }

    const accessToken = generateToken(res, student._id)

    res.status(200).json({
        success: true,
        message: 'Student logged in successfully',
        accessToken
    });
});

// @desc    Get refresh token
// @route   POST /api/students/refresh
// @access  Public
export const refreshAccessToken = asyncHandler(async (req, res) => {
    const token = req.cookies.refreshToken;

    if (!token) {
        res.status(401);
        throw new Error('No refresh token provided');
    }

    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

    const student = await Student.findOne(decoded.id).select('-password');

    if (!student) {
        res.status(401);
        throw new Error('Student not found');
    }

    // Generate new access token
    const accessToken = jwt.sign(
        { id: student._id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15m' }
    );

    res.status(200).json({
        success: true,
        accessToken,
    });
});

// @desc    Logout student
// @route   POST /api/students/logout
// @access  Private
export const logout = asyncHandler(async (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});