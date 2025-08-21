import axios from 'axios';
// --- Single request interceptor ---
const BASE_URL = process.env.NEXT_PUBLIC_BASE_ROUTE || 'http://localhost:8000/api/';

const AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

// Helper function to check if token is expired
const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

AxiosInstance.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token && !isTokenExpired(token)) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    } else if (token && isTokenExpired(token)) {
      // Clean up expired token
      localStorage.removeItem('token');
      localStorage.removeItem('refresh');
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log('📤 Request', {
      method: config.method,
      url: (config.baseURL || '') + (config.url || ''),
      headers: config.headers,
      data: config.data
    });
  }

  return config;
});
// Response interceptor for handling auth errors
AxiosInstance.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('📥 Response', {
        status: response.status,
        url: response.config?.url,
        data: response.data
      });
    }
    return response;
  },
  (error) => {
    // Handle 401 errors globally
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh');
      window.location.href = '/login';
    }
    
    if (process.env.NODE_ENV !== 'production') {
      console.error('❌ Response error', {
        status: error.response?.status,
        url: error.config?.url,
        data: error.response?.data
      });
    }
    return Promise.reject(error);
  }
);

export default AxiosInstance;
