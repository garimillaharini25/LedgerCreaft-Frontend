import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';

// In production, VITE_API_BASE_URL must be specified via environment or default to relative path
const baseURL = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL
  : import.meta.env.PROD
  ? ''
  : 'http://localhost:8080';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor: attach JWT token if present
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle errors globally & notify router via events
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    if (!error.response) {
      toast.error('Network connection issue. Please verify backend service.');
      return Promise.reject(new Error('Network error. Backend unreachable.'));
    }

    const { status, data } = error.response;
    const message = data?.message || data?.error || 'An unexpected error occurred';

    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');

      // Dispatch event for React router navigation without full page reload
      window.dispatchEvent(new CustomEvent('auth:unauthorized', { detail: { message } }));
    } else if (status === 403) {
      toast.error('Access forbidden: You do not have permission for this resource.');
    } else if (status === 400) {
      if (data?.validationErrors && typeof data.validationErrors === 'object') {
        const firstValErr = Object.values(data.validationErrors)[0];
        toast.error(String(firstValErr));
      } else {
        toast.error(message);
      }
    } else if (status === 429) {
      toast.error(message || 'Too many requests. Please wait a moment.');
    } else if (status >= 500) {
      toast.error('Server error. Please try again shortly.');
    }

    return Promise.reject(error);
  }
);

export default api;
