import api from '../api/axios';
import { ApiResponse, User } from '../types';

export interface UpdateProfilePayload {
  name: string;
  currency?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface UpdateSettingsPayload {
  theme?: string;
  defaultDateRange?: string;
  budgetNotificationsEnabled?: boolean;
}

export const userService = {
  async getMe(): Promise<User> {
    const res = await api.get<ApiResponse<User>>('/api/users/me');
    return res.data.data;
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<User> {
    const res = await api.put<ApiResponse<User>>('/api/users/me', payload);
    return res.data.data;
  },

  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    await api.put<ApiResponse<void>>('/api/users/me/password', payload);
  },

  async updateSettings(payload: UpdateSettingsPayload): Promise<User> {
    const res = await api.put<ApiResponse<User>>('/api/users/me/settings', payload);
    return res.data.data;
  },
};
