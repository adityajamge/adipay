import api from './api';

const unwrap = (response: any) => response?.data?.data ?? response?.data;

export const userService = {
  // Query backend database explicitly tracking multiple profile attributes globally mapped
  searchUsers: async (q: string) => {
    // Encodes URI to securely send spaced names (e.g. 'Parth K') globally
    const response = await api.get(`/users/search?q=${encodeURIComponent(q)}`);
    const payload = unwrap(response) || {};
    return {
      ...payload,
      users: Array.isArray(payload.users)
        ? payload.users.map((user: any) => ({
            ...user,
            id: String(user?.id ?? user?.user_id),
            phone_number: user?.phone_number ?? user?.phone,
          }))
        : [],
    };
  }
};
