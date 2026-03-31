import api from './api';

const unwrap = (response: any) => response?.data?.data ?? response?.data;

export const walletService = {
  // Get current authenticated user's balance
  getBalance: async () => {
    const response = await api.get('/wallet/balance');
    return unwrap(response);
  },

  // Add fictional money to virtual wallet
  addMoney: async (amount: number) => {
    const response = await api.post('/wallet/add', { amount });
    return unwrap(response);
  }
};
