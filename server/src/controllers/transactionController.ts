import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';

// @desc    Send money to user
// @route   POST /api/transactions/send
// @access  Private
export const sendMoney = async (req: AuthRequest, res: Response) => {
  try {
    const { receiver_identifier, amount, note } = req.body;
    
    // TODO: Verify sender has enough balance
    // TODO: Wrap inside isolated Database Transaction transferring values safely

    return res.status(200).json({
      success: true,
      data: {
        message: 'Transfer successful',
        transaction: {
          reference_no: `ADP-TXN-${Math.floor(Math.random() * 1000000)}`,
          amount: Number(amount),
          type: 'DEBIT',
          note: note || ''
        }
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get transaction history
// @route   GET /api/transactions/history
// @access  Private
export const getHistory = async (req: AuthRequest, res: Response) => {
  try {
    // TODO: JOIN Query against transactions table where sender_id or receiver_id maps to user_id
    // TODO: Order by created_at DESC
    
    return res.status(200).json({
      success: true,
      data: {
        transactions: [] // Send array footprint
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get recent recipients (contacts)
// @route   GET /api/transactions/recent-contacts
// @access  Private
export const getRecentContacts = async (req: AuthRequest, res: Response) => {
  try {
    // TODO: Run DISTINCT mapping isolating specific user profiles tied to prior sent transactions

    return res.status(200).json({
      success: true,
      data: {
        contacts: []
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get transaction detail
// @route   GET /api/transactions/:id
// @access  Private
export const getTransactionDetail = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    // TODO: Select deep mapping specifics of exact transaction record

    return res.status(200).json({
      success: true,
      data: {
        transaction: {
          id,
          status: 'Completed'
        }
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};
