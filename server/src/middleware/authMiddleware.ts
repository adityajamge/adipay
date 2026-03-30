import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request to safely hold the JWT payload
export interface AuthRequest extends Request {
  user?: { user_id: number; email: string; phone: string; [key: string]: any };
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided'
    });
  }

  try {
    // Decode and verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'adipay_secure_fallback_secret') as any;
    
    // Attach user payload to request object for chained controllers
    req.user = decoded;
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token verification failed'
    });
  }
};
