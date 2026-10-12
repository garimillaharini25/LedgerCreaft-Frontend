import api from '../api/axios';
import { ApiResponse, Notification } from '../types';

export const notificationService = {
  async getNotifications(): Promise<Notification[]> {
    const res = await api.get<ApiResponse<Notification[]>>('/api/notifications');
    return res.data.data;
  },

  async markAsRead(id: number): Promise<Notification> {
    const res = await api.put<ApiResponse<Notification>>(`/api/notifications/${id}/read`);
    return res.data.data;
  },

  async markAllAsRead(): Promise<void> {
    await api.put<ApiResponse<void>>('/api/notifications/read-all');
  },
};
