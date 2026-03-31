import api from './api';

const unwrap = (response: any) => response?.data?.data ?? response?.data;

export const authService = {
  // Register new user
  signup: async (userData: any) => {
    const response = await api.post('/auth/signup', userData);
    return unwrap(response);
  },
  
  // Authenticate user
  login: async (identifier: string, password: string) => {
    const response = await api.post('/auth/login', { identifier, password });
    return unwrap(response);
  },
  
  // Get active user session info natively using intercepted JWT
  getMe: async () => {
    const response = await api.get('/auth/me');
    const payload = unwrap(response);
    return {
      ...payload,
      phone_number: payload?.phone_number ?? payload?.phone,
    };
  },
  
  // Update Profile
  updateProfile: async (profileData: any) => {
    const response = await api.put('/auth/profile', profileData);
    return unwrap(response);
  },
  
  // Update Password
  changePassword: async (passwordData: any) => {
    const response = await api.put('/auth/password', passwordData);
    return unwrap(response);
  }
};
