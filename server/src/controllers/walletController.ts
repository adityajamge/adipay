import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';

// @desc    Get current balance
// @route   GET /api/wallet/balance
// @access  Private
export const getBalance = async (req: AuthRequest, res: Response) => {
  try {
    const user_id = req.user?.user_id;
    // TODO: Fetch live balance from Wallet DB joined with User tables

    return res.status(200).json({
      success: true,
      data: {
        balance: 12450.00
      }
    });
  } catch (error) {
    console.error('Wallet Balance Error:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Add money to wallet
// @route   POST /api/wallet/add
// @access  Private
export const addMoney = async (req: AuthRequest, res: Response) => {
  try {
    const { amount } = req.body;
    const user_id = req.user?.user_id;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid or missing amount' });
    }

    // TODO: Safely perform DB transactions: Update wallet balance + push history log
    const new_balance = 12450.00 + Number(amount);
    
    // Exact spec formatting as requested in 5.3
    return res.status(200).json({
      success: true,
      data: {
        new_balance,
        transaction: {
          reference_no: `ADP-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 10000)}`,
          amount: Number(amount),
          type: 'CREDIT',
          description: 'Added to wallet'
        }
      }
    });
  } catch (error) {
    console.error('Wallet Add Error:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};
