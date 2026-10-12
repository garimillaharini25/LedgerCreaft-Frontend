import api from '../api/axios';
import { ApiResponse, User } from '../types';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponseData {
  token: string;
  tokenType: string;
  user: User;
}

export const authService = {
  async register(payload: RegisterPayload): Promise<AuthResponseData> {
    const res = await api.post<ApiResponse<AuthResponseData>>('/api/auth/register', payload);
    return res.data.data;
  },

  async login(payload: LoginPayload): Promise<AuthResponseData> {
    const res = await api.post<ApiResponse<AuthResponseData>>('/api/auth/login', payload);
    return res.data.data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/api/auth/logout');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },
};
