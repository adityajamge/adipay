import api from './api';

const unwrap = (response: any) => response?.data?.data ?? response?.data;

const normalizeType = (tx: any): 'sent' | 'received' | 'added' => {
  if (tx?.type === 'sent' || tx?.type === 'received' || tx?.type === 'added') {
    return tx.type;
  }

  const direction = String(tx?.direction || '').toLowerCase();
  if (direction === 'sent') return 'sent';
  if (direction === 'received') return 'received';
  if (direction === 'added') return 'added';

  const transactionType = String(tx?.transaction_type || '').toUpperCase();
  if (transactionType === 'CREDIT' && !tx?.counterparty && !tx?.recipient) {
    return 'added';
  }

  return 'sent';
};

const mapTransaction = (tx: any) => {
  const type = normalizeType(tx);
  const id = tx?.id ?? tx?.transaction_id ?? tx?.reference_no;

  return {
    ...tx,
    id: String(id),
    transaction_id: tx?.transaction_id ?? (typeof id === 'number' ? id : undefined),
    amount: Number(tx?.amount ?? 0),
    type,
    party_name:
      tx?.party_name ||
      tx?.counterparty?.full_name ||
      tx?.recipient?.full_name ||
      (type === 'added' ? 'Wallet' : 'Unknown'),
    created_at: tx?.created_at,
  };
};

const mapRequest = (request: any) => ({
  ...request,
  id: String(request?.id ?? request?.request_id),
  request_id: request?.request_id ?? (typeof request?.id === 'number' ? request.id : undefined),
  amount: Number(request?.amount ?? 0),
  status: String(request?.status || 'PENDING').toUpperCase(),
  created_at: request?.created_at,
});

export const transactionService = {
  // Push an active debit transmission securely passing payload
  sendMoney: async (data: { recipient_identifier: string, amount: number, description?: string }) => {
    const response = await api.post('/transactions/send', data);
    const payload = unwrap(response) || {};
    return {
      ...payload,
      transaction: payload.transaction ? mapTransaction(payload.transaction) : undefined,
    };
  },

  // Create a pending money request from another user
  requestMoney: async (data: { payer_identifier: string, amount: number, description?: string }) => {
    const response = await api.post('/transactions/request', data);
    const payload = unwrap(response) || {};
    return {
      ...payload,
      request: payload.request ? mapRequest(payload.request) : undefined,
    };
  },

  // Get pending requests where current user is payer (incoming) or requester (outgoing)
  getPendingRequests: async () => {
    const response = await api.get('/transactions/requests');
    const payload = unwrap(response) || {};
    return {
      ...payload,
      incoming: Array.isArray(payload.incoming) ? payload.incoming.map(mapRequest) : [],
      outgoing: Array.isArray(payload.outgoing) ? payload.outgoing.map(mapRequest) : [],
    };
  },

  // Pay a specific pending request
  payRequest: async (id: string) => {
    const response = await api.post(`/transactions/requests/${id}/pay`);
    const payload = unwrap(response) || {};
    return {
      ...payload,
      transaction: payload.transaction ? mapTransaction(payload.transaction) : undefined,
    };
  },

  // Reject or cancel a pending request
  rejectRequest: async (id: string) => {
    const response = await api.post(`/transactions/requests/${id}/reject`);
    return unwrap(response) || {};
  },
  
  // Scrape descending list of successful historical debits/credits supporting params
  getHistory: async (page = 1, limit = 20, filter = 'all') => {
    const response = await api.get(`/transactions/history?page=${page}&limit=${limit}&filter=${filter}`);
    const payload = unwrap(response) || {};
    return {
      ...payload,
      transactions: Array.isArray(payload.transactions)
        ? payload.transactions.map(mapTransaction)
        : [],
    };
  },
  
  // Provide deeper analytical specifics targeting one particular interaction 
  getTransactionDetail: async (id: string) => {
    const response = await api.get(`/transactions/${id}`);
    const payload = unwrap(response) || {};
    return {
      ...payload,
      transaction: payload.transaction ? mapTransaction(payload.transaction) : undefined,
    };
  },
  
  // Rapid mapping of standard receiver patterns 
  getRecentContacts: async () => {
    const response = await api.get('/transactions/recent-contacts');
    const payload = unwrap(response) || {};
    return {
      ...payload,
      contacts: Array.isArray(payload.contacts)
        ? payload.contacts.map((contact: any) => ({
            ...contact,
            id: String(contact?.id ?? contact?.user_id),
            phone_number: contact?.phone_number ?? contact?.phone,
          }))
        : [],
    };
  }
};
