import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';

// @desc    Search users by name, phone, or email
// @route   GET /api/users/search?q=value
// @access  Private
export const searchUsers = async (req: AuthRequest, res: Response) => {
  try {
    const q = req.query.q as string;
    
    // Safety check ensuring deep search doesn't trigger on empty string requests
    if (!q || q.length < 2) {
      return res.status(200).json({
        success: true,
        data: { users: [] }
      });
    }

    // TODO: DB full-text search using ILIKE or REGEXP query scanning name, phone, and email parameters dynamically
    
    // Mock user result based on the 5.5 parameter q=parth spec
    return res.status(200).json({
      success: true,
      data: {
        users: [
          {
            user_id: 2,
            full_name: 'Parth Kondhawale',
            phone: '9876543210',
            email: 'parth@example.com'
          }
        ]
      }
    });

  } catch (error) {
    console.error('User Search API Error:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};
