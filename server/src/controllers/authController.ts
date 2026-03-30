import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { AuthRequest } from '../middleware/authMiddleware';

// Utility helper to sign JWTs natively enforcing Section 7 Payload Spec
const generateToken = (user_id: number, email: string) => {
  return jwt.sign(
    { user_id, email },
    process.env.JWT_SECRET || 'adipay_secure_fallback_secret',
    { expiresIn: '7d', algorithm: 'HS256' } // 7-day expiry explicitly bounded
  );
};

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
export const signup = async (req: Request, res: Response) => {
  try {
    const { full_name, email, phone, password } = req.body;
    
    // Hash password via bcrypt with exactly 12 salt rounds globally (anti-theft spec)
    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(password, salt);
    
    // TODO: Verify if email/phone exists
    // TODO: Insert into database passing `password_hash` instead of raw `password`

    // Mock response following 5.2 spec exactly (never exposing password_hash)
    const user = { user_id: 1, full_name, email, phone };
    const token = generateToken(user.user_id, user.email);

    return res.status(201).json({
      success: true,
      data: { user, token }
    });
  } catch (error) {
    console.error('Signup Error:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body;
    
    // TODO: Fetch user object natively isolating hashed string from DB payload
    
    // Security Action: Block logic bypassing matching string comparisons
    // const isMatch = await bcrypt.compare(password, userFromDb.password_hash);
    // if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    // Mock success resolving to spec
    const user = { 
      user_id: 1, 
      full_name: 'Aditya Jamge', 
      email: identifier.includes('@') ? identifier : 'aditya@example.com', 
      phone: identifier.includes('@') ? '9876543210' : identifier 
    };
    const token = generateToken(user.user_id, user.email);

    return res.status(200).json({
      success: true,
      data: { user, token }
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user_id = req.user?.user_id;

    // TODO: Fetch comprehensive profile from database using user_id ensuring fresh details

    return res.status(200).json({
      success: true,
      data: {
        user: {
          user_id,
          full_name: 'Aditya Jamge',
          email: req.user?.email,
          phone: req.user?.phone
        }
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { full_name, email } = req.body;
    // TODO: Update fields in Postgres DB based on req.user.user_id
    
    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Change user password
// @route   PUT /api/auth/password
// @access  Private
export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { current_password, new_password } = req.body;
    // TODO: Verify current_password
    // TODO: Hash new_password and save to DB
    
    return res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};
