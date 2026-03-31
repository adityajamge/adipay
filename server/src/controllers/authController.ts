import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { AuthRequest } from '../middleware/authMiddleware';
import { query } from '../config/database';

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
export const signup = async (req: Request, res: Response): Promise<any> => {
  try {
    const { full_name, email, phone_number: phone, password } = req.body;
    
    // For testing/debugging compatibility:
    const actualPhone = phone || req.body.phone;

    if (!full_name || !email || !actualPhone || !password) {
      return res.status(400).json({ success: false, message: 'Missing required signup fields' });
    }

    // Check if user exists
    const existing = await query('SELECT * FROM users WHERE email = $1 OR phone = $2', [email, actualPhone]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'User with this email or phone already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(password, salt);
    
    // Insert user
    const userResult = await query(
      'INSERT INTO users (full_name, email, phone, password_hash) VALUES ($1, $2, $3, $4) RETURNING user_id, full_name, email, phone',
      [full_name, email, actualPhone, password_hash]
    );

    const user = userResult.rows[0];

    // Create wallet account
    await query('INSERT INTO accounts (user_id) VALUES ($1)', [user.user_id]);

    const token = generateToken(user.user_id, user.email);

    return res.status(201).json({
      success: true,
      data: { user, token }
    });
  } catch (error: any) {
    console.error('Signup Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Identifier and password are required' });
    }
    
    // Support login via email or phone
    const userResult = await query(
      'SELECT * FROM users WHERE email = $1 OR phone = $1',
      [identifier]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const dbUser = userResult.rows[0];

    // Security Action: Verify hash
    const isMatch = await bcrypt.compare(password, dbUser.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = { 
      user_id: dbUser.user_id, 
      full_name: dbUser.full_name, 
      email: dbUser.email, 
      phone: dbUser.phone 
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
export const getMe = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const user_id = req.user?.user_id;

    const userResult = await query('SELECT user_id, full_name, email, phone FROM users WHERE user_id = $1', [user_id]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json(userResult.rows[0]);
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user_id = req.user?.user_id;
    if (!user_id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const full_name = typeof req.body?.full_name === 'string' ? req.body.full_name.trim() : undefined;
    const email = typeof req.body?.email === 'string' ? req.body.email.trim() : undefined;
    const phone = typeof req.body?.phone_number === 'string'
      ? req.body.phone_number.trim()
      : (typeof req.body?.phone === 'string' ? req.body.phone.trim() : undefined);

    if (!full_name && !email && !phone) {
      return res.status(400).json({ success: false, message: 'No profile fields provided' });
    }

    const currentUserResult = await query(
      'SELECT user_id, full_name, email, phone FROM users WHERE user_id = $1 LIMIT 1',
      [user_id]
    );

    if (currentUserResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const currentUser = currentUserResult.rows[0];
    const nextFullName = full_name || currentUser.full_name;
    const nextEmail = email || currentUser.email;
    const nextPhone = phone || currentUser.phone;

    const conflictResult = await query(
      'SELECT user_id FROM users WHERE (email = $1 OR phone = $2) AND user_id <> $3 LIMIT 1',
      [nextEmail, nextPhone, user_id]
    );

    if (conflictResult.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Email or phone already in use' });
    }

    const updatedResult = await query(
      `UPDATE users
       SET full_name = $1,
           email = $2,
           phone = $3
       WHERE user_id = $4
       RETURNING user_id, full_name, email, phone`,
      [nextFullName, nextEmail, nextPhone, user_id]
    );
    const updatedUser = updatedResult.rows[0];
    
    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Change user password
// @route   PUT /api/auth/password
// @access  Private
export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { current_password, new_password } = req.body;
    const user_id = req.user?.user_id;

    if (!user_id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    if (!current_password || !new_password) {
      return res.status(400).json({ success: false, message: 'Current and new password are required' });
    }

    if (String(new_password).length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const userResult = await query(
      'SELECT password_hash FROM users WHERE user_id = $1 LIMIT 1',
      [user_id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const currentHash = userResult.rows[0].password_hash as string;
    const isMatch = await bcrypt.compare(String(current_password), currentHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(12);
    const newHash = await bcrypt.hash(String(new_password), salt);

    await query(
      'UPDATE users SET password_hash = $1 WHERE user_id = $2',
      [newHash, user_id]
    );
    
    return res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change Password Error:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};
