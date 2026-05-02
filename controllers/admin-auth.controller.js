import User from '../models/User.js';
import asyncHandler from 'express-async-handler';
import sendMail from '../utils/sendMail.js';
import generateToken from '../utils/generateToken.js';
import crypto from "crypto";
import jwt from 'jsonwebtoken';



// @desc    Register a new admin
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  // Validate input
  if (!name || !email || !password || !phone) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  // Check existing user
  const existingUser = await User.findOne({
    $or: [{ email }, { phone }],
  });

  if (existingUser) {
    res.status(400);
    throw new Error('User with this email or phone already exists');
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    phone,
  });

  const accessToken = generateToken(res, user._id);
  const verificationToken = user.getVerificationToken();

  // send the welcome email
  const verificationUrl = `http://localhost:5000/api/auth/verify-email/${verificationToken}`;
  const message = `
<div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
  <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
    
    <!-- Header -->
    <div style="background: #4f46e5; color: white; padding: 20px; text-align: center;">
      <h1 style="margin: 0;">Welcome to ScholarSync 🎓</h1>
    </div>

    <!-- Body -->
    <div style="padding: 30px; color: #333;">
      <h2 style="margin-top: 0;">Hello ${user.name},</h2>
      
      <p style="line-height: 1.6;">
        We’re excited to have you join <strong>ScholarSync</strong>! Your journey towards smarter learning and management starts here.
      </p>

      <p style="line-height: 1.6;">
        To get started, please verify your email address by clicking the button below:
      </p>

      <!-- Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" 
           style="background: #4f46e5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
          Verify Email
        </a>
      </div>

      <p style="line-height: 1.6;">
        If you did not create this account, please ignore this email.
      </p>

      <p style="margin-top: 30px;">
        Best regards,<br/>
        <strong>ScholarSync Team</strong>
      </p>
    </div>

    <!-- Footer -->
    <div style="background: #f1f1f1; text-align: center; padding: 15px; font-size: 12px; color: #777;">
      © ${new Date().getFullYear()} ScholarSync. All rights reserved.
    </div>

  </div>
</div>
`;

  await sendMail({
    to: user.email,
    subject: 'Welcome to ScholarSync! Please verify your email',
    message,
  });

  user.save({ validateBeforeSave: false });

  res.status(201).json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
    },
    accessToken,
  });
});


// @desc    Login admin
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, phone, password } = req.body;

  if (!password || (!email && !phone)) {
    res.status(400);
    throw new Error('Provide email or phone and password');
  }

  const user = await User.findOne({
    $or: [{ email }, { phone }],
  });

  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error('Invalid email/phone or password');
  }

  const accessToken = generateToken(res, user._id);

  res.status(200).json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
    },
    accessToken,
  });
});

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const hashedToken = await crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({ verificationToken: hashedToken });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired verification token');
  }
  user.isVerified = true;
  user.isAdmin = true;
  user.verificationToken = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: 'Email verified successfully',
  });
});


// @desc  Forgot password
// @route POST /api/auth/forgot-password
// @access Public
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email, phone } = req.body;
  if (!email || !phone) {
    res.status(400);
    throw new Error('Please provide email or phone');
  }

  const user = await User.findOne({
    $or: [{ email }, { phone }]
  });
  if (!user) {
    res.status(404);
    throw new Error('No user found with this email or phone');
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `http://localhost:5000/api/auth/reset-password/${resetToken}`;
  const message = `
<div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
  <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
    
    <!-- Header -->
    <div style="background: #ef4444; color: white; padding: 20px; text-align: center;">
      <h1 style="margin: 0;">Password Reset Request 🔐</h1>
    </div>

    <!-- Body -->
    <div style="padding: 30px; color: #333;">
      <h2 style="margin-top: 0;">Hello ${user.name},</h2>
      
      <p style="line-height: 1.6;">
        We received a request to reset your password for your <strong>ScholarSync</strong> account.
      </p>

      <p style="line-height: 1.6;">
        Click the button below to set a new password:
      </p>

      <!-- Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" 
           style="background: #ef4444; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
          Reset Password
        </a>
      </div>

      <p style="line-height: 1.6;">
        This link will expire shortly for security reasons. If you did not request a password reset, you can safely ignore this email.
      </p>

      <p style="margin-top: 30px;">
        Stay secure,<br/>
        <strong>ScholarSync Team</strong>
      </p>
    </div>

    <!-- Footer -->
    <div style="background: #f1f1f1; text-align: center; padding: 15px; font-size: 12px; color: #777;">
      © ${new Date().getFullYear()} ScholarSync. All rights reserved.
    </div>

  </div>
</div>
`;

  await sendMail({
    to: user.email,
    subject: 'Password Reset Request for ScholarSync',
    message,
  });

  res.status(200).json({
    success: true,
    message: 'Password reset email sent',
  });
});

// @desc  Reset password
// @route POST /api/auth/reset-password/:token
// @access Public
export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  console.log('reset token from url: ', token);
  
  if (!password) {
    res.status(400);
    throw new Error('Please provide a new password');
  } 

  const hashedToken = await crypto.createHash('sha256').update(token).digest('hex');
  console.log('the hashed one: ', hashedToken);
  const user = await User.findOne({ resetPasswordToken: hashedToken, resetPasswordTokenExpire: { $gt: Date.now() } });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired reset token');
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordTokenExpire = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password reset successful',
  });
});

// @desc    Refresh Access Token
// @route   POST /api/auth/refresh
// @access  Public (uses HTTP-only cookie)
export const refreshAccessToken = asyncHandler(async (req, res) => {
    const token = req.cookies.refreshToken;

    if (!token) {
        res.status(401);
        throw new Error('No refresh token provided');
    }

    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
        res.status(401);
        throw new Error('User not found');
    }

    // Generate new access token
    const accessToken = jwt.sign(
        { id: user._id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15m' }
    );

    res.status(200).json({
        success: true,
        accessToken,
    });
});


// @desc    Logout admin
// @route   POST /api/auth/logout
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