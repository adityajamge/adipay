import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../middleware/authMiddleware';

// Utility helper to sign JWTs natively
const generateToken = (user_id: number, email: string, phone: string) => {
  return jwt.sign(
    { user_id, email, phone },
    process.env.JWT_SECRET || 'adipay_secure_fallback_secret',
    { expiresIn: '30d' }
  );
};

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
export const signup = async (req: Request, res: Response) => {
  try {
    const { full_name, email, phone, password } = req.body;
    
    // TODO: Verify if email/phone exists
    // TODO: Hash password via bcrypt
    // TODO: Insert into database

    // Mock response following 5.2 spec exactly
    const user = { user_id: 1, full_name, email, phone };
    const token = generateToken(user.user_id, user.email, user.phone);

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
    
    // TODO: Fetch user by email OR phone
    // TODO: Compare hashed passwords via bcrypt.compare

    // Mock success resolving to spec
    const user = { 
      user_id: 1, 
      full_name: 'Aditya Jamge', 
      email: identifier.includes('@') ? identifier : 'aditya@example.com', 
      phone: identifier.includes('@') ? '9876543210' : identifier 
    };
    const token = generateToken(user.user_id, user.email, user.phone);

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
