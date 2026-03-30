import api from './api';

export const walletService = {
  // Get current authenticated user's balance
  getBalance: async () => {
    const response = await api.get('/wallet/balance');
    return response.data;
  },

  // Add fictional money to virtual wallet
  addMoney: async (amount: number) => {
    const response = await api.post('/wallet/add', { amount });
    return response.data;
  }
};
