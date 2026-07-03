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

  // Reviews - Product
  getProductReviews: async (params?: PaginationParams) => {
    const response = await api.get<PaginatedResponse<any>>('/reviews/admin/products/', { params });
    return response.data;
  },

  approveProductReview: async (id: string) => {
    const response = await api.post<ApiResponse<any>>(`/reviews/admin/products/${id}/approve/`);
    return response.data.data;
  },

  rejectProductReview: async (id: string) => {
    const response = await api.post<ApiResponse<any>>(`/reviews/admin/products/${id}/reject/`);
    return response.data.data;
  },

  // Reviews - Seller
  getSellerReviews: async (params?: PaginationParams) => {
    const response = await api.get<PaginatedResponse<any>>('/reviews/admin/sellers/', { params });
    return response.data;
  },

  approveSellerReview: async (id: string) => {
    const response = await api.post<ApiResponse<any>>(`/reviews/admin/sellers/${id}/approve/`);
    return response.data.data;
  },

  rejectSellerReview: async (id: string) => {
    const response = await api.post<ApiResponse<any>>(`/reviews/admin/sellers/${id}/reject/`);
    return response.data.data;
  },
};
