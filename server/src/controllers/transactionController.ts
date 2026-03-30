import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';

// @desc    Send money to user
// @route   POST /api/transactions/send
// @access  Private
export const sendMoney = async (req: AuthRequest, res: Response) => {
  try {
    const { recipient_identifier, amount, description } = req.body;
    
    // TODO: Verify sender has enough balance
    // TODO: Wrap inside isolated Database Transaction transferring values safely

    return res.status(200).json({
      success: true,
      data: {
        transaction: {
          transaction_id: 42,
          reference_no: `ADP-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-A7K3`,
          amount: Number(amount),
          transaction_type: 'TRANSFER',
          description: description || 'Transfer',
          recipient: {
            full_name: 'Parth Kondhawale',
            phone: recipient_identifier.includes('@') ? '9876543210' : recipient_identifier
          },
          created_at: new Date().toISOString()
        },
        new_balance: 11950.00
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
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const filter = req.query.filter || 'all';

    // TODO: JOIN Query against transactions table based on pagination constraints
    
    return res.status(200).json({
      success: true,
      data: {
        transactions: [
          {
            transaction_id: 42,
            reference_no: "ADP-20260330-A7K3",
            amount: 500.00,
            transaction_type: "TRANSFER",
            direction: "SENT",
            description: "Lunch money",
            counterparty: {
              full_name: "Parth Kondhawale",
              phone: "9876543210"
            },
            created_at: "2026-03-30T14:30:00Z"
          }
        ],
        pagination: {
          page,
          limit,
          total: 45,
          has_more: true
        }
      }
    });
  } catch (error) {
    console.error('History Query Error:', error);
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
