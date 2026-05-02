import e from 'express';
import jwt from 'jsonwebtoken';

const generateToken = (res, id) => {
    // Generate access token
    const accessToken = jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '15m',
    });

    // Generate refresh token
    const refreshToken = jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: '7d',
    });

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, 
    });

    return accessToken;
}

export default generateToken;