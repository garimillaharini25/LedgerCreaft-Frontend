import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';

// Resolve and sanitize backend API base URL
const rawBaseURL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? '' : 'http://localhost:8080');
const baseURL = (rawBaseURL || '').trim().replace(/\/+$/, '');

// Warn in console if Vercel deployment has no VITE_API_BASE_URL configured
if (import.meta.env.PROD && !baseURL) {
  console.warn(
    '⚠️ [ExpenseTracker] VITE_API_BASE_URL is not set in your Vercel project environment variables!\n' +
    'API calls are defaulting to the Vercel frontend host, causing login/API failures.\n' +
    'To fix: Add VITE_API_BASE_URL=https://<your-render-service>.onrender.com in Vercel settings and redeploy.'
  );
}

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60s timeout to accommodate Render free-tier cold starts
});

// Request interceptor: attach JWT token if present
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // If running in production with no configured backend base URL, notify user immediately
    if (import.meta.env.PROD && !baseURL && config.url?.startsWith('/api')) {
      toast.error('Backend URL not configured in Vercel! Please add VITE_API_BASE_URL in Vercel settings.', {
        id: 'missing-api-url',
        duration: 8000,
      });
    }

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
      if (error.code === 'ECONNABORTED') {
        toast.error('Request timed out. The Render server may be waking up from sleep. Please try again in 10-20 seconds.', {
          duration: 6000,
        });
      } else if (import.meta.env.PROD && !baseURL) {
        toast.error('Backend URL not configured in Vercel. Please set VITE_API_BASE_URL in Vercel environment variables.', {
          duration: 8000,
        });
      } else {
        toast.error('Cannot connect to backend server. Render service may be starting up or sleeping. Please retry shortly.');
      }
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
