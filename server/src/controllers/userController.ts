import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { query } from '../config/database';

// @desc    Search users by name, phone, or email
// @route   GET /api/users/search?q=value
// @access  Private
export const searchUsers = async (req: AuthRequest, res: Response) => {
  try {
    const q = String(req.query.q || '').trim();
    const user_id = req.user?.user_id;

    if (!user_id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    if (!q || q.length < 2) {
      return res.status(200).json({
        success: true,
        data: { users: [] }
      });
    }

    const pattern = `%${q}%`;

    const result = await query(
      `SELECT user_id, full_name, email, phone
       FROM users
       WHERE user_id <> $1
         AND is_active = TRUE
         AND (
           full_name ILIKE $2
           OR email ILIKE $2
           OR phone ILIKE $2
         )
       ORDER BY
         CASE
           WHEN phone = $3 THEN 0
           WHEN email = $3 THEN 1
           ELSE 2
         END,
         full_name ASC
       LIMIT 20`,
      [user_id, pattern, q]
    );

    const users = result.rows.map((row: { user_id: number; full_name: string; email: string; phone: string }) => ({
      id: String(row.user_id),
      user_id: Number(row.user_id),
      full_name: row.full_name,
      email: row.email,
      phone: row.phone,
      phone_number: row.phone,
    }));

    return res.status(200).json({
      success: true,
      data: {
        users
      }
    });

  } catch (error) {
    console.error('User Search API Error:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};
