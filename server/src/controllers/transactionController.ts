import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { pool, query } from '../config/database';

type HistoryFilter = 'all' | 'sent' | 'received' | 'added';

interface TxRow {
  transaction_id: number;
  reference_no: string;
  amount: string | number;
  transaction_type: 'TRANSFER' | 'CREDIT' | 'DEBIT';
  status: string;
  description: string | null;
  created_at: string;
  sender_id: number | null;
  receiver_id: number | null;
  sender_name: string | null;
  sender_phone: string | null;
  receiver_name: string | null;
  receiver_phone: string | null;
}

interface RequestRow {
  transaction_id: number;
  reference_no: string;
  amount: string | number;
  status: string;
  description: string | null;
  created_at: string;
  sender_id: number;
  receiver_id: number;
  payer_name: string;
  payer_phone: string;
  requester_name: string;
  requester_phone: string;
}

const createHttpError = (message: string, status: number) => {
  const error = new Error(message) as Error & { status: number };
  error.status = status;
  return error;
};

const generateReferenceNo = () => {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ADP-${datePart}-${randomPart}`;
};

const getUserAccount = async (userId: number) => {
  const accountResult = await query(
    'SELECT account_id, balance FROM accounts WHERE user_id = $1 AND is_active = TRUE LIMIT 1',
    [userId]
  );

  if (accountResult.rows.length === 0) {
    return null;
  }

  return {
    account_id: Number(accountResult.rows[0].account_id),
    balance: Number(accountResult.rows[0].balance),
  };
};

const mapTransactionView = (row: TxRow, accountId: number) => {
  const senderId = row.sender_id ? Number(row.sender_id) : null;
  const receiverId = row.receiver_id ? Number(row.receiver_id) : null;

  const isAdded = row.transaction_type === 'CREDIT' && receiverId === accountId && senderId === null;
  const isSent = row.transaction_type === 'TRANSFER' && senderId === accountId;
  const isReceived = row.transaction_type === 'TRANSFER' && receiverId === accountId;

  const type: 'sent' | 'received' | 'added' = isAdded ? 'added' : isSent ? 'sent' : 'received';
  const direction = isSent ? 'SENT' : isReceived ? 'RECEIVED' : 'ADDED';

  let counterparty: { full_name: string; phone: string } | null = null;
  if (isSent && row.receiver_name && row.receiver_phone) {
    counterparty = { full_name: row.receiver_name, phone: row.receiver_phone };
  }
  if (isReceived && row.sender_name && row.sender_phone) {
    counterparty = { full_name: row.sender_name, phone: row.sender_phone };
  }

  return {
    id: String(row.transaction_id),
    transaction_id: Number(row.transaction_id),
    reference_no: row.reference_no,
    amount: Number(row.amount),
    transaction_type: row.transaction_type,
    direction,
    type,
    description: row.description || '',
    party_name: counterparty?.full_name || (isAdded ? 'Wallet' : 'Unknown'),
    counterparty,
    created_at: row.created_at,
    status: row.status || 'COMPLETED',
  };
};

const mapRequestView = (row: RequestRow, accountId: number) => {
  const payerId = Number(row.sender_id);
  const requesterId = Number(row.receiver_id);
  const direction: 'incoming' | 'outgoing' = payerId === accountId ? 'incoming' : 'outgoing';

  return {
    id: String(row.transaction_id),
    request_id: Number(row.transaction_id),
    reference_no: row.reference_no,
    amount: Number(row.amount),
    status: String(row.status || 'PENDING').toUpperCase(),
    description: row.description || '',
    direction,
    payer: {
      full_name: row.payer_name,
      phone: row.payer_phone,
    },
    requester: {
      full_name: row.requester_name,
      phone: row.requester_phone,
    },
    created_at: row.created_at,
  };
};

// @desc    Send money to user
// @route   POST /api/transactions/send
// @access  Private
export const sendMoney = async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  
  try {
    const recipient_identifier = String(req.body?.recipient_identifier || '').trim();
    const amount = Number(req.body?.amount);
    const description = String(req.body?.description || 'Transfer');
    const sender_user_id = req.user?.user_id;

    if (!sender_user_id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    if (!recipient_identifier) {
      return res.status(400).json({ success: false, message: 'Recipient is required' });
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid transfer amount' });
    }

    await client.query('BEGIN');

    const senderRes = await client.query(
      'SELECT account_id, balance FROM accounts WHERE user_id = $1 AND is_active = TRUE FOR UPDATE',
      [sender_user_id]
    );

    if (senderRes.rows.length === 0) {
      throw createHttpError('Sender account not found', 404);
    }
    const senderAccount = senderRes.rows[0];

    if (Number(senderAccount.balance) < Number(amount)) {
      throw createHttpError('Insufficient funds', 400);
    }

    const receiverRes = await client.query(
      `SELECT u.user_id, u.full_name, u.phone, a.account_id
       FROM users u
       JOIN accounts a ON u.user_id = a.user_id
       WHERE (u.phone = $1 OR u.email = $1)
         AND u.is_active = TRUE
         AND a.is_active = TRUE
       FOR UPDATE`,
      [recipient_identifier]
    );

    if (receiverRes.rows.length === 0) {
      throw createHttpError('Recipient not found', 404);
    }
    const receiverData = receiverRes.rows[0];

    if (Number(senderAccount.account_id) === Number(receiverData.account_id)) {
      throw createHttpError('Cannot send money to yourself', 400);
    }

    const updateSenderRes = await client.query(
      'UPDATE accounts SET balance = balance - $1 WHERE account_id = $2 RETURNING balance',
      [amount, senderAccount.account_id]
    );
    const new_balance = Number(updateSenderRes.rows[0].balance);

    await client.query(
      'UPDATE accounts SET balance = balance + $1 WHERE account_id = $2',
      [amount, receiverData.account_id]
    );

    const refNo = generateReferenceNo();
    
    const txnRes = await client.query(
      `INSERT INTO transactions (
         reference_no,
         sender_id,
         receiver_id,
         amount,
         transaction_type,
         status,
         description
       )
       VALUES ($1, $2, $3, $4, 'TRANSFER', 'COMPLETED', $5)
       RETURNING transaction_id, reference_no, amount, description, created_at, status`,
      [refNo, senderAccount.account_id, receiverData.account_id, amount, description]
    );
    const newTxn = txnRes.rows[0] as {
      transaction_id: number;
      reference_no: string;
      amount: string | number;
      description: string;
      created_at: string;
      status: string;
    };

    await client.query('COMMIT');

    return res.status(200).json({
      success: true,
      data: {
        transaction: {
          id: Number(newTxn.transaction_id),
          transaction_id: Number(newTxn.transaction_id),
          reference_no: newTxn.reference_no,
          amount: Number(newTxn.amount),
          transaction_type: 'TRANSFER',
          type: 'sent',
          description: newTxn.description,
          recipient: {
            full_name: receiverData.full_name,
            phone: receiverData.phone
          },
          created_at: newTxn.created_at,
          status: newTxn.status,
        },
        new_balance,
        balance: new_balance,
      }
    });
  } catch (error: any) {
    try {
      await client.query('ROLLBACK');
    } catch {
      // Ignore rollback errors.
    }
    console.error('Send Money ACID Transaction Error:', error);
    const msg = error.message || 'Server Error';
    const status = Number.isInteger(error.status) ? error.status : 400;
    return res.status(status).json({ success: false, message: msg });
  } finally {
    client.release();
  }
};

// @desc    Create payment request
// @route   POST /api/transactions/request
// @access  Private
export const requestMoney = async (req: AuthRequest, res: Response) => {
  try {
    const payer_identifier = String(req.body?.payer_identifier || '').trim();
    const amount = Number(req.body?.amount);
    const description = String(req.body?.description || 'Payment request');
    const requester_user_id = req.user?.user_id;

    if (!requester_user_id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    if (!payer_identifier) {
      return res.status(400).json({ success: false, message: 'Payer is required' });
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid request amount' });
    }

    const requesterAccountRes = await query(
      'SELECT account_id, balance FROM accounts WHERE user_id = $1 AND is_active = TRUE LIMIT 1',
      [requester_user_id]
    );

    if (requesterAccountRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Requester account not found' });
    }

    const requesterAccountId = Number(requesterAccountRes.rows[0].account_id);

    const payerRes = await query(
      `SELECT u.user_id, u.full_name, u.phone, a.account_id
       FROM users u
       JOIN accounts a ON u.user_id = a.user_id
       WHERE (u.phone = $1 OR u.email = $1)
         AND u.is_active = TRUE
         AND a.is_active = TRUE
       LIMIT 1`,
      [payer_identifier]
    );

    if (payerRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Payer not found' });
    }

    const payerData = payerRes.rows[0] as {
      user_id: number;
      full_name: string;
      phone: string;
      account_id: number;
    };

    if (Number(payerData.account_id) === requesterAccountId) {
      return res.status(400).json({ success: false, message: 'Cannot request money from yourself' });
    }

    const requesterUserRes = await query(
      'SELECT full_name, phone FROM users WHERE user_id = $1 LIMIT 1',
      [requester_user_id]
    );

    if (requesterUserRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Requester user not found' });
    }

    const requesterUser = requesterUserRes.rows[0] as { full_name: string; phone: string };
    const referenceNo = generateReferenceNo();

    const requestInsertRes = await query(
      `INSERT INTO transactions (
         reference_no,
         sender_id,
         receiver_id,
         amount,
         transaction_type,
         status,
         description
       )
       VALUES ($1, $2, $3, $4, 'TRANSFER', 'PENDING', $5)
       RETURNING transaction_id, reference_no, amount, status, description, created_at`,
      [referenceNo, payerData.account_id, requesterAccountId, amount, description]
    );

    const requested = requestInsertRes.rows[0] as {
      transaction_id: number;
      reference_no: string;
      amount: string | number;
      status: string;
      description: string;
      created_at: string;
    };

    return res.status(201).json({
      success: true,
      data: {
        request: {
          id: Number(requested.transaction_id),
          request_id: Number(requested.transaction_id),
          reference_no: requested.reference_no,
          amount: Number(requested.amount),
          status: requested.status,
          description: requested.description,
          payer: {
            full_name: payerData.full_name,
            phone: payerData.phone,
          },
          requester: {
            full_name: requesterUser.full_name,
            phone: requesterUser.phone,
          },
          created_at: requested.created_at,
        }
      }
    });
  } catch (error) {
    console.error('Request Money Error:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get pending payment requests
// @route   GET /api/transactions/requests
// @access  Private
export const getPendingRequests = async (req: AuthRequest, res: Response) => {
  try {
    const user_id = req.user?.user_id;

    if (!user_id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const account = await getUserAccount(user_id);
    if (!account) {
      return res.status(404).json({ success: false, message: 'Wallet account not found' });
    }

    const requestsRes = await query(
      `SELECT
         t.transaction_id,
         t.reference_no,
         t.amount,
         t.status,
         t.description,
         t.created_at,
         t.sender_id,
         t.receiver_id,
         su.full_name AS payer_name,
         su.phone AS payer_phone,
         ru.full_name AS requester_name,
         ru.phone AS requester_phone
       FROM transactions t
       JOIN accounts sa ON t.sender_id = sa.account_id
       JOIN users su ON sa.user_id = su.user_id
       JOIN accounts ra ON t.receiver_id = ra.account_id
       JOIN users ru ON ra.user_id = ru.user_id
       WHERE t.transaction_type = 'TRANSFER'
         AND t.status = 'PENDING'
         AND (t.sender_id = $1 OR t.receiver_id = $1)
       ORDER BY t.created_at DESC
       LIMIT 50`,
      [account.account_id]
    );

    const incoming: any[] = [];
    const outgoing: any[] = [];

    for (const row of requestsRes.rows as RequestRow[]) {
      const mapped = mapRequestView(row, account.account_id);
      if (mapped.direction === 'incoming') {
        incoming.push(mapped);
      } else {
        outgoing.push(mapped);
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        incoming,
        outgoing,
      }
    });
  } catch (error) {
    console.error('Pending Requests Error:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Pay a pending request
// @route   POST /api/transactions/requests/:id/pay
// @access  Private
export const payRequest = async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();

  try {
    const user_id = req.user?.user_id;
    const requestId = Number(req.params.id);

    if (!user_id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    if (!Number.isInteger(requestId) || requestId <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid request id' });
    }

    await client.query('BEGIN');

    const payerAccountRes = await client.query(
      'SELECT account_id, balance FROM accounts WHERE user_id = $1 AND is_active = TRUE FOR UPDATE',
      [user_id]
    );

    if (payerAccountRes.rows.length === 0) {
      throw createHttpError('Wallet account not found', 404);
    }

    const payerAccount = {
      account_id: Number(payerAccountRes.rows[0].account_id),
      balance: Number(payerAccountRes.rows[0].balance),
    };

    const requestRes = await client.query(
      `SELECT transaction_id, sender_id, receiver_id, amount, status
       FROM transactions
       WHERE transaction_id = $1
         AND transaction_type = 'TRANSFER'
       FOR UPDATE`,
      [requestId]
    );

    if (requestRes.rows.length === 0) {
      throw createHttpError('Request not found', 404);
    }

    const requestTx = requestRes.rows[0] as {
      sender_id: number;
      receiver_id: number;
      amount: string | number;
      status: string;
    };

    if (String(requestTx.status).toUpperCase() !== 'PENDING') {
      throw createHttpError('Request is already processed', 400);
    }

    if (Number(requestTx.sender_id) !== payerAccount.account_id) {
      throw createHttpError('You are not allowed to pay this request', 403);
    }

    const amount = Number(requestTx.amount);
    if (payerAccount.balance < amount) {
      throw createHttpError('Insufficient funds', 400);
    }

    const updatedSenderRes = await client.query(
      'UPDATE accounts SET balance = balance - $1 WHERE account_id = $2 RETURNING balance',
      [amount, payerAccount.account_id]
    );
    const new_balance = Number(updatedSenderRes.rows[0].balance);

    await client.query(
      'UPDATE accounts SET balance = balance + $1 WHERE account_id = $2',
      [amount, Number(requestTx.receiver_id)]
    );

    await client.query(
      `UPDATE transactions
       SET status = 'COMPLETED'
       WHERE transaction_id = $1`,
      [requestId]
    );

    const updatedTxRes = await client.query(
      `SELECT
         t.transaction_id,
         t.reference_no,
         t.amount,
         t.transaction_type,
         t.status,
         t.description,
         t.created_at,
         t.sender_id,
         t.receiver_id,
         su.full_name AS sender_name,
         su.phone AS sender_phone,
         ru.full_name AS receiver_name,
         ru.phone AS receiver_phone
       FROM transactions t
       LEFT JOIN accounts sa ON t.sender_id = sa.account_id
       LEFT JOIN users su ON sa.user_id = su.user_id
       LEFT JOIN accounts ra ON t.receiver_id = ra.account_id
       LEFT JOIN users ru ON ra.user_id = ru.user_id
       WHERE t.transaction_id = $1
       LIMIT 1`,
      [requestId]
    );

    await client.query('COMMIT');

    const transaction = mapTransactionView(updatedTxRes.rows[0] as TxRow, payerAccount.account_id);

    return res.status(200).json({
      success: true,
      data: {
        transaction,
        new_balance,
        balance: new_balance,
      }
    });
  } catch (error: any) {
    try {
      await client.query('ROLLBACK');
    } catch {
      // Ignore rollback errors.
    }
    console.error('Pay Request Error:', error);
    const status = Number.isInteger(error.status) ? error.status : 400;
    return res.status(status).json({ success: false, message: error.message || 'Server Error' });
  } finally {
    client.release();
  }
};

// @desc    Reject or cancel a pending request
// @route   POST /api/transactions/requests/:id/reject
// @access  Private
export const rejectRequest = async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();

  try {
    const user_id = req.user?.user_id;
    const requestId = Number(req.params.id);

    if (!user_id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    if (!Number.isInteger(requestId) || requestId <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid request id' });
    }

    await client.query('BEGIN');

    const accountRes = await client.query(
      'SELECT account_id FROM accounts WHERE user_id = $1 AND is_active = TRUE LIMIT 1',
      [user_id]
    );

    if (accountRes.rows.length === 0) {
      throw createHttpError('Wallet account not found', 404);
    }
    const accountId = Number(accountRes.rows[0].account_id);

    const requestRes = await client.query(
      `SELECT transaction_id, sender_id, receiver_id, status
       FROM transactions
       WHERE transaction_id = $1
         AND transaction_type = 'TRANSFER'
       FOR UPDATE`,
      [requestId]
    );

    if (requestRes.rows.length === 0) {
      throw createHttpError('Request not found', 404);
    }

    const requestTx = requestRes.rows[0] as { sender_id: number; receiver_id: number; status: string };

    if (String(requestTx.status).toUpperCase() !== 'PENDING') {
      throw createHttpError('Request is already processed', 400);
    }

    if (Number(requestTx.sender_id) !== accountId && Number(requestTx.receiver_id) !== accountId) {
      throw createHttpError('You are not allowed to update this request', 403);
    }

    await client.query(
      `UPDATE transactions
       SET status = 'FAILED'
       WHERE transaction_id = $1`,
      [requestId]
    );

    await client.query('COMMIT');

    return res.status(200).json({
      success: true,
      message: 'Request updated successfully'
    });
  } catch (error: any) {
    try {
      await client.query('ROLLBACK');
    } catch {
      // Ignore rollback errors.
    }
    console.error('Reject Request Error:', error);
    const status = Number.isInteger(error.status) ? error.status : 400;
    return res.status(status).json({ success: false, message: error.message || 'Server Error' });
  } finally {
    client.release();
  }
};

// @desc    Get transaction history
// @route   GET /api/transactions/history
// @access  Private
export const getHistory = async (req: AuthRequest, res: Response) => {
  try {
    const user_id = req.user?.user_id;
    if (!user_id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const requestedFilter = String(req.query.filter || 'all').toLowerCase() as HistoryFilter;
    const filter: HistoryFilter = ['all', 'sent', 'received', 'added'].includes(requestedFilter)
      ? requestedFilter
      : 'all';
    const offset = (page - 1) * limit;

    const account = await getUserAccount(user_id);
    if (!account) {
      return res.status(404).json({ success: false, message: 'Wallet account not found' });
    }

    let whereClause = "(t.sender_id = $1 OR t.receiver_id = $1) AND t.status = 'COMPLETED'";
    if (filter === 'sent') {
      whereClause = "t.sender_id = $1 AND t.transaction_type = 'TRANSFER' AND t.status = 'COMPLETED'";
    }
    if (filter === 'received') {
      whereClause = "t.receiver_id = $1 AND t.transaction_type = 'TRANSFER' AND t.status = 'COMPLETED'";
    }
    if (filter === 'added') {
      whereClause = "t.receiver_id = $1 AND t.transaction_type = 'CREDIT' AND t.sender_id IS NULL AND t.status = 'COMPLETED'";
    }

    const totalResult = await query(
      `SELECT COUNT(*)::int AS total
       FROM transactions t
       WHERE ${whereClause}`,
      [account.account_id]
    );
    const total = Number(totalResult.rows[0].total || 0);

    const historyResult = await query(
      `SELECT
         t.transaction_id,
         t.reference_no,
         t.amount,
         t.transaction_type,
         t.status,
         t.description,
         t.created_at,
         t.sender_id,
         t.receiver_id,
         su.full_name AS sender_name,
         su.phone AS sender_phone,
         ru.full_name AS receiver_name,
         ru.phone AS receiver_phone
       FROM transactions t
       LEFT JOIN accounts sa ON t.sender_id = sa.account_id
       LEFT JOIN users su ON sa.user_id = su.user_id
       LEFT JOIN accounts ra ON t.receiver_id = ra.account_id
       LEFT JOIN users ru ON ra.user_id = ru.user_id
       WHERE ${whereClause}
       ORDER BY t.created_at DESC
       LIMIT $2 OFFSET $3`,
      [account.account_id, limit, offset]
    );

    const transactions = (historyResult.rows as TxRow[]).map((row) =>
      mapTransactionView(row, account.account_id)
    );
    
    return res.status(200).json({
      success: true,
      data: {
        transactions,
        pagination: {
          page,
          limit,
          total,
          has_more: offset + transactions.length < total
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
    const user_id = req.user?.user_id;
    if (!user_id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const contactsResult = await query(
      `SELECT
         u.user_id,
         u.full_name,
         u.phone,
         MAX(t.created_at) AS last_sent_at
       FROM transactions t
       JOIN accounts sa ON t.sender_id = sa.account_id
       JOIN accounts ra ON t.receiver_id = ra.account_id
       JOIN users u ON ra.user_id = u.user_id
       WHERE sa.user_id = $1
         AND t.transaction_type = 'TRANSFER'
         AND t.status = 'COMPLETED'
       GROUP BY u.user_id, u.full_name, u.phone
       ORDER BY last_sent_at DESC
       LIMIT 10`,
      [user_id]
    );

    const contacts = contactsResult.rows.map((row: { user_id: number; full_name: string; phone: string }) => ({
      id: String(row.user_id),
      user_id: Number(row.user_id),
      full_name: row.full_name,
      phone: row.phone,
      phone_number: row.phone,
    }));

    return res.status(200).json({
      success: true,
      data: {
        contacts
      }
    });
  } catch (error) {
    console.error('Recent Contacts Query Error:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get transaction detail
// @route   GET /api/transactions/:id
// @access  Private
export const getTransactionDetail = async (req: AuthRequest, res: Response) => {
  try {
    const user_id = req.user?.user_id;
    const txId = Number(req.params.id);

    if (!user_id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    if (!Number.isInteger(txId) || txId <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid transaction id' });
    }

    const account = await getUserAccount(user_id);
    if (!account) {
      return res.status(404).json({ success: false, message: 'Wallet account not found' });
    }

    const detailResult = await query(
      `SELECT
         t.transaction_id,
         t.reference_no,
         t.amount,
         t.transaction_type,
         t.status,
         t.description,
         t.created_at,
         t.sender_id,
         t.receiver_id,
         su.full_name AS sender_name,
         su.phone AS sender_phone,
         ru.full_name AS receiver_name,
         ru.phone AS receiver_phone
       FROM transactions t
       LEFT JOIN accounts sa ON t.sender_id = sa.account_id
       LEFT JOIN users su ON sa.user_id = su.user_id
       LEFT JOIN accounts ra ON t.receiver_id = ra.account_id
       LEFT JOIN users ru ON ra.user_id = ru.user_id
       WHERE t.transaction_id = $2
         AND (t.sender_id = $1 OR t.receiver_id = $1)
       LIMIT 1`,
      [account.account_id, txId]
    );

    if (detailResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    const transaction = mapTransactionView(detailResult.rows[0] as TxRow, account.account_id);

    return res.status(200).json({
      success: true,
      data: {
        transaction
      }
    });
  } catch (error) {
    console.error('Transaction Detail Error:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};
