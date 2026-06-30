import api from '@/config/api';
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/types';
import type { Notification } from '@/types/notification';

export const notificationService = {
  getNotifications: async (params?: PaginationParams) => {
    const response = await api.get<PaginatedResponse<Notification>>('/notifications/', { params });
    return response.data;
  },

  getNotification: async (id: string) => {
    const response = await api.get<ApiResponse<Notification>>(`/notifications/${id}/`);
    return response.data.data;
  },

  markAsRead: async (id: string) => {
    const response = await api.post<ApiResponse<Notification>>(`/notifications/${id}/read/`);
    return response.data.data;
  },

  markAllAsRead: async () => {
    const response = await api.post<ApiResponse<{ message: string }>>('/notifications/read-all/');
    return response.data.data;
  },

  getUnreadCount: async () => {
    const response = await api.get<ApiResponse<{ count: number }>>('/notifications/unread-count/');
    return response.data.data;
  },

  deleteNotification: async (id: string) => {
    await api.delete(`/notifications/${id}/`);
  },
};
