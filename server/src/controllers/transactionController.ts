import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { pool } from '../config/database';

// @desc    Send money to user
// @route   POST /api/transactions/send
// @access  Private
export const sendMoney = async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  
  try {
    const { recipient_identifier, amount, description } = req.body;
    const sender_user_id = req.user?.user_id;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid transfer amount' });
    }

    // Ensure ACID compliance using PG transaction protocol
    await client.query('BEGIN');

    // 1. Lock sender row to prevent race conditions
    const senderRes = await client.query(
      'SELECT account_id, balance FROM accounts WHERE user_id = $1 FOR UPDATE',
      [sender_user_id]
    );

    if (senderRes.rows.length === 0) {
      throw new Error('Sender account not found');
    }
    const senderAccount = senderRes.rows[0];

    // 2. Verify sufficient funds natively handling decimals
    if (Number(senderAccount.balance) < Number(amount)) {
      throw new Error('Insufficient funds');
    }

    // Lookup Receiver targeting Phone or Email dynamically
    const receiverRes = await client.query(
      'SELECT u.full_name, u.phone, a.account_id FROM users u JOIN accounts a ON u.user_id = a.user_id WHERE u.phone = $1 OR u.email = $1 FOR UPDATE',
      [recipient_identifier]
    );

    if (receiverRes.rows.length === 0) {
      throw new Error('Recipient not found');
    }
    const receiverData = receiverRes.rows[0];

    if (senderAccount.account_id === receiverData.account_id) {
        throw new Error('Cannot send money to yourself');
    }

    // 3. Debit sender natively capturing output
    const updateSenderRes = await client.query(
      'UPDATE accounts SET balance = balance - $1 WHERE account_id = $2 RETURNING balance',
      [amount, senderAccount.account_id]
    );
    const new_balance = updateSenderRes.rows[0].balance;

    // 4. Credit receiver safely scaling integer limits
    await client.query(
      'UPDATE accounts SET balance = balance + $1 WHERE account_id = $2',
      [amount, receiverData.account_id]
    );

    // 5. Log transaction
    const refNo = `ADP-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    
    const txnRes = await client.query(
      `INSERT INTO transactions (reference_no, sender_id, receiver_id, amount, transaction_type, description)
       VALUES ($1, $2, $3, $4, 'TRANSFER', $5) RETURNING transaction_id, created_at`,
      [refNo, senderAccount.account_id, receiverData.account_id, amount, description || 'Transfer']
    );
    const newTxn = txnRes.rows[0];

    // Safely execute array
    await client.query('COMMIT');

    // Map footprint natively to specific layout matching SDK expectation exactly 
    return res.status(200).json({
      success: true,
      data: {
        transaction: {
          transaction_id: newTxn.transaction_id,
          reference_no: refNo,
          amount: Number(amount),
          transaction_type: 'TRANSFER',
          description: description || 'Transfer',
          recipient: {
            full_name: receiverData.full_name,
            phone: receiverData.phone
          },
          created_at: newTxn.created_at
        },
        new_balance: Number(new_balance)
      }
    });
  } catch (error: any) {
    // If any DB instruction flags an internal constraint block recursively trigger cancellation rollbacks globally
    await client.query('ROLLBACK');
    console.error('Send Money ACID Transaction Error:', error);
    const msg = error.message || 'Server Error';
    return res.status(400).json({ success: false, message: msg });
  } finally {
    // Safely release native PostgreSQL connection lock 
    client.release();
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
