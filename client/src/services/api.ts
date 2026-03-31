import axios from 'axios';
import { Preferences } from '@capacitor/preferences';

// 5. Backend API Design -> 5.1 Base URL
// Vite exposes import.meta.env.MODE to determine the current environment
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.MODE === 'production' 
  ? 'https://adipay-api.onrender.com/api'
  : 'http://localhost:3000/api');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, 
});

// Request Interceptor: Automatically attach the JWT auth token to every request
api.interceptors.request.use(
  async (config) => {
    try {
      // In Capacitor, Preferences is the standard secure-ish Key-Value store mapped to SharedPreferences/UserDefaults
      const { value: token } = await Preferences.get({ key: 'jwt_token' });
      
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Could not fetch auth token for request', error);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional Response Interceptor for global error handling (e.g., 401 Unauthorized -> logout)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // If server rejects our token, wipe it locally
      await Preferences.remove({ key: 'jwt_token' });
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/signup' && currentPath !== '/splash' && currentPath !== '/onboarding') {
        window.location.href = '/login'; 
      }
    }
    return Promise.reject(error);
  }
);

export default api;
