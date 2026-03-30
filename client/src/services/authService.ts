import api from './api';

export const authService = {
  // Register new user
  signup: async (userData: any) => {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  },
  
  // Authenticate user
  login: async (identifier: string, password: string) => {
    const response = await api.post('/auth/login', { identifier, password });
    return response.data;
  },
  
  // Get active user session info natively using intercepted JWT
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  
  // Update Profile
  updateProfile: async (profileData: any) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },
  
  // Update Password
  changePassword: async (passwordData: any) => {
    const response = await api.put('/auth/password', passwordData);
    return response.data;
  }
};
