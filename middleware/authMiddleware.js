import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Teacher from '../models/Teacher.js';

export const adminAuthMiddleware = asyncHandler(async (req, res, next) => {
    let token;
    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

            req.user = await User.findById(decoded.id).select('-password');
            
            if (!req.user.isAdmin && !req.user.isVerified && !req.user.isActive) {
                res.status(403);
                throw new Error('Not authorized, access denied');
            }

            
            next();
        } catch (error) {
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    } else {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});


export const teacherAuthMiddleware = asyncHandler(async (req, res, next) => {
    let token;
    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

            req.user = await Teacher.findById(decoded.id).select('-password');
            
            if (!req.user.isActive) {
                res.status(403);
                throw new Error('Not authorized, access denied');
            }

            next();
        } catch (error) {
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    } else {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});
