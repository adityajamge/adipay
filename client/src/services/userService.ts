import api from './api';

export const userService = {
  // Query backend database explicitly tracking multiple profile attributes globally mapped
  searchUsers: async (q: string) => {
    // Encodes URI to securely send spaced names (e.g. 'Parth K') globally
    const response = await api.get(`/users/search?q=${encodeURIComponent(q)}`);
    return response.data;
  }
};
