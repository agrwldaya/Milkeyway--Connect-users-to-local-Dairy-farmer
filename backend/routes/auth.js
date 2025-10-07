// Common Logout Route
import express from "express";
import { forgotPassword } from "../controllers/autocontroller.js";
const authRouter = express.Router();

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