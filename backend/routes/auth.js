// Common Logout Route
import express from "express";
import { forgotPassword } from "../controllers/autocontroller.js";
import { generateAccessToken } from "../utils/jwtUtils.js";
import { pool } from "../config/database/database.js";
import jwt from "jsonwebtoken";

const authRouter = express.Router();

// Token refresh endpoint
authRouter.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({ 
        success: false, 
        message: 'Refresh token not found' 
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Check if user still exists and refresh token is valid
    const user = await pool.query(
      "SELECT id, name, email, role, refresh_token FROM users WHERE id = $1 AND refresh_token = $2",
      [decoded.id, refreshToken]
    );

    if (user.rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid refresh token' 
      });
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(user.rows[0]);
    
    // Set new access token cookie
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie("token", newAccessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
      maxAge: 2 * 60 * 60 * 1000, // 2 hours
    });

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      user: {
        id: user.rows[0].id,
        name: user.rows[0].name,
        email: user.rows[0].email,
        role: user.rows[0].role,
      }
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    return res.status(401).json({ 
      success: false, 
      message: 'Token refresh failed' 
    });
  }
});

authRouter.post('/logout', (req, res) => {
    const isProd = process.env.NODE_ENV === 'production';
  
    res.clearCookie('token', {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      path: '/',
    });
  
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      path: '/refresh',
    });
    
    return res.status(200).json({ message: 'Logged out' });
  });

authRouter.post('/forgot-password', forgotPassword);

export default authRouter;