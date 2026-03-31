import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { pool, query } from '../config/database';

const generateReferenceNo = () => {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ADP-${datePart}-${randomPart}`;
};

// @desc    Get current balance
// @route   GET /api/wallet/balance
// @access  Private
export const getBalance = async (req: AuthRequest, res: Response) => {
  try {
    const user_id = req.user?.user_id;

    if (!user_id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const accountResult = await query(
      'SELECT balance FROM accounts WHERE user_id = $1 AND is_active = TRUE LIMIT 1',
      [user_id]
    );

    if (accountResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Wallet account not found' });
    }

    return res.status(200).json({
      success: true,
      data: {
        balance: Number(accountResult.rows[0].balance)
      },
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
  const client = await pool.connect();

  try {
    const amount = Number(req.body?.amount);
    const user_id = req.user?.user_id;

    if (!user_id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid or missing amount' });
    }

    await client.query('BEGIN');

    const accountResult = await client.query(
      'SELECT account_id FROM accounts WHERE user_id = $1 AND is_active = TRUE FOR UPDATE',
      [user_id]
    );

    if (accountResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Wallet account not found' });
    }

    const account_id = Number(accountResult.rows[0].account_id);

    const updatedAccount = await client.query(
      'UPDATE accounts SET balance = balance + $1 WHERE account_id = $2 RETURNING balance',
      [amount, account_id]
    );

    const new_balance = Number(updatedAccount.rows[0].balance);
    const reference_no = generateReferenceNo();

    const transactionResult = await client.query(
      `INSERT INTO transactions (
         reference_no,
         sender_id,
         receiver_id,
         amount,
         transaction_type,
         status,
         description
       )
       VALUES ($1, NULL, $2, $3, 'CREDIT', 'COMPLETED', $4)
       RETURNING transaction_id, reference_no, amount, description, created_at`,
      [reference_no, account_id, amount, 'Added to wallet']
    );

    await client.query('COMMIT');

    const txn = transactionResult.rows[0];

    return res.status(200).json({
      success: true,
      data: {
        new_balance,
        balance: new_balance,
        transaction: {
          id: Number(txn.transaction_id),
          transaction_id: Number(txn.transaction_id),
          reference_no: txn.reference_no,
          amount: Number(txn.amount),
          type: 'CREDIT',
          description: txn.description,
          created_at: txn.created_at,
        }
      }
    });
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch {
      // Ignore rollback errors.
    }
    console.error('Wallet Add Error:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  } finally {
    client.release();
  }
};
