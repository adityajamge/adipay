import api from './api';

export const transactionService = {
  // Push an active debit transmission securely passing payload
  sendMoney: async (data: { recipient_identifier: string, amount: number, description?: string }) => {
    const response = await api.post('/transactions/send', data);
    return response.data;
  },
  
  // Scrape descending list of successful historical debits/credits supporting params
  getHistory: async (page = 1, limit = 20, filter = 'all') => {
    const response = await api.get(`/transactions/history?page=${page}&limit=${limit}&filter=${filter}`);
    return response.data;
  },
  
  // Provide deeper analytical specifics targeting one particular interaction 
  getTransactionDetail: async (id: string) => {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },
  
  // Rapid mapping of standard receiver patterns 
  getRecentContacts: async () => {
    const response = await api.get('/transactions/recent-contacts');
    return response.data;
  }
};
