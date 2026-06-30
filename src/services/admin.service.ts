import api from '@/config/api';
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/types';
import type { User } from '@/types/user';
import type { SellerProfile } from '@/types/seller';

export const adminService = {
  getUsers: async (params?: PaginationParams) => {
    const response = await api.get<PaginatedResponse<User>>('/users/admin/users/', { params });
    return response.data;
  },

  getUser: async (id: string) => {
    const response = await api.get<ApiResponse<User>>(`/users/admin/users/${id}/`);
    return response.data.data;
  },

  toggleUserStatus: async (id: string) => {
    const response = await api.post<ApiResponse<User>>(`/users/admin/users/${id}/toggle-status/`);
    return response.data.data;
  },

  getSellerApprovals: async (params?: PaginationParams) => {
    const response = await api.get<PaginatedResponse<SellerProfile>>('/sellers/admin/sellers/', { params });
    return response.data;
  },

  approveSeller: async (id: string, reason?: string) => {
    const response = await api.post<ApiResponse<SellerProfile>>(`/sellers/admin/sellers/${id}/approve/`, { action: 'approve', reason });
    return response.data.data;
  },

  rejectSeller: async (id: string, reason: string) => {
    const response = await api.post<ApiResponse<SellerProfile>>(`/sellers/admin/sellers/${id}/approve/`, { action: 'reject', reason });
    return response.data.data;
  },
};
